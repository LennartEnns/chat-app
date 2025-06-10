import {
    getPostgrestErrorMessage,
    logPostgrestError,
} from "~~/errors/postgrestErrors";
import type { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";
import type { UserCommandPaletteItem } from "~/types/userSearch";
import {
    validateDisplayNameSearch,
    validateUsernameSearch,
} from "~~/validation/commonRules";

/**
 * Composable that provides stateful logic for the user search command palette.
 */
export function useUserSearch() {
    const supabase = useSupabaseClient();
    const operationFeedbackHandler = useOperationFeedbackHandler();
    const excludeIds = ref<string[]>([]);
    const excludeGroupId = ref<string | null>(null);
    const excludeHasInvitationsTo = ref<string | null>(null);

    const unknownErrorMessage = "Unknown error during data retrieval";
    const minTimeBetweenSearches = 500; // ms
    const userSelectLimit = 5; // Should match the limit inside the search_users sql function

    const searchTerm = ref("");
    // Smallest subterm (substring in the current term)
    // for which the db search returned less than [userSelectLimit] users
    const lastRedundantSubterm = ref<string | null>(null);

    const users = ref<UserCommandPaletteItem[]>([]);
    const loading = ref(false);

    // @ts-expect-error ignore deep type instantiation warning
    const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => [
        {
            id: "users",
            label: searchTerm.value
                ? `Users matching “${searchTerm.value}”...`
                : "Users",
            items: users.value,

            // If we already have all matching users, search locally
            ignoreFilter: !lastRedundantSubterm.value,
        },
    ]);
    
    async function searchUsersInDatabase(term: string) {
        const usersQuery = supabase.rpc('search_users', {
            p_term: term,
            p_excluded_ids: excludeIds.value.length === 0 ? undefined : excludeIds.value,
            p_exclude_group_id: excludeGroupId.value ?? undefined,
            p_exclude_invitations_to_group: excludeHasInvitationsTo.value ?? undefined,
        })

        const { data, error } = await usersQuery;
        loading.value = false;

        if (error) {
            logPostgrestError(error, "data retrieval");
            operationFeedbackHandler.displayError(
                getPostgrestErrorMessage(error, unknownErrorMessage),
            );
            return;
        } else if (data.length < userSelectLimit) {
            // We know for sure that we already have all users that match the term,
            // so no more database fetching is necessary for queries that have this as a substring
            lastRedundantSubterm.value = term;
        }

        users.value = (data || [])
            // @ts-expect-error ignore deep type instantiation warning
            .map((user) => ({
                id: user.user_id,
                label: user.displayname ?? user.username,
                suffix: user.username,
                avatar: {
                    src: getAvatarUrl(user.user_id),
                    icon: "i-lucide-user",
                    ui: {
                        icon: "size-11/12",
                    },
                },
                user,
            }));
    }

    // Timeout mechanism to prevent spamming from the client
    const searchTimeout = ref<NodeJS.Timeout | null>(null);
    watch(searchTerm, (newTerm) => {
        if (searchTimeout.value) {
            clearTimeout(searchTimeout.value);
            searchTimeout.value = null;
        }
        if (
            newTerm === "" ||
            (!validateUsernameSearch(newTerm) &&
                !validateDisplayNameSearch(newTerm))
        ) {
            loading.value = false;
            return;
        }
        loading.value = true;
        searchTimeout.value = setTimeout(() => {
            if (searchTerm.value !== newTerm) return;
            if (lastRedundantSubterm.value) {
                if (
                    newTerm.toLowerCase().includes(
                        lastRedundantSubterm.value.toLowerCase(),
                    )
                ) {
                    loading.value = false;
                    return;
                } else {
                    // Last redundant subterm is not a substring anymore => Need to switch to db search again
                    lastRedundantSubterm.value = null;
                }
            }
            searchUsersInDatabase(newTerm);
        }, minTimeBetweenSearches);
    });

    // Filter current list in addition to db search
    watch(excludeIds, (exclude) => {
        users.value = users.value.filter((user) =>
            exclude.indexOf((user as UserCommandPaletteItem).user.user_id) < 0
        );
    })

    return {
        searchTerm,
        groups,
        loading,
        excludeIds,
        excludeGroupId,
        excludeHasInvitationsTo,
    };
}
