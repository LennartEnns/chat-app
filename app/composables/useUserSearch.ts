import { ref, watch } from "vue";
import type { CommandGroup, CommandItem, Users } from "../types/userSearch";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import {
    getPostgrestErrorMessage,
    logPostgrestError,
} from "~~/errors/postgrestErrors";

export function useUserSearch() {
    const supabase = useSupabaseClient();
    const operationFeedbackHandler = useOperationFeedbackHandler();
    const unknownErrorMessage = "Unknown error during data retrieval";
    const username = useSupabaseUser().value?.user_metadata?.username ?? "";

    const users = ref<CommandItem[]>([]);
    const groups = ref<CommandGroup[]>([
        {
            id: "users",
            label: "Users",
            items: [],
        },
    ]);
    const searchTerm = ref("");

    async function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            await searchUsers(searchTerm.value);
        }
    }

    async function searchUsers(searchTerm: string) {
        if (searchTerm === "") {
            users.value = [];
            updateGroups();
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("username")
            .or(`username.ilike.%${searchTerm}%, displayname.ilike.%${searchTerm}%`)
            .limit(5);

        if (error) {
            logPostgrestError(error, "data retrieval");
            operationFeedbackHandler.displayError(
                getPostgrestErrorMessage(error, unknownErrorMessage),
            );
            return;
        }

        users.value = (data || [])
            .filter((user: Users) => {
                return (
                    user &&
                    user.user_id &&
                    user.user_id.trim() !== "" &&
                    user.username !== username &&
                    user.displayname &&
                    user.displayname.trim() !== ""
                );
            })
            .map((user: Users) => ({
                id: user.user_id,
                label: user.displayname,
                suffix: user.username,
                to: `/profile/${user.username}`,
                target: "_self",
                avatar: { src: getAvatarUrl(user.user_id) },
                raw: user,
            }));
        updateGroups();
    }
    function updateGroups() {
        groups.value = [
            {
                id: "users",
                label: "Users",
                items: users.value,
            },
        ];
    }
    watch(searchTerm, searchUsers);

    return {
        searchTerm,
        groups,
        handleKeydown,
    };
}

export function getAvatarUrl(userId: string): string {
    const supabase = useSupabaseClient();
    const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl("public/" + userId + ".jpg");
    if (
        !data.publicUrl ||
        data.publicUrl.includes("error") ||
        data.publicUrl === ""
    ) {
        return "";
    }
    return data.publicUrl;
}
