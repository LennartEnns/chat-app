import { ref, watch } from "vue";
import type { CommandGroup, CommandItem, Users } from "../types/userSearch";
import { useSupabaseClient, useSupabaseUser, useToast } from "#imports";

export function useUserSearch() {
    const supabase = useSupabaseClient();
    const toast = useToast();
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

    async function searchUsers(searchTerm: string) {
        if (searchTerm === "") {
            users.value = [];
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .or(`username.ilike.%${searchTerm}%, displayname.ilike.%${searchTerm}%`)
            .limit(5);

        if (error) {
            toast.add({
                title: "Error loading users",
                description: error.message,
                color: "error",
            });
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
