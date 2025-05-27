export interface Users {
    user_id: string;
    username: string;
    displayname: string;
    description: string;
}

export interface CommandItem {
    id: string;
    label: string;
    suffix: string;
    to: string;
    target: string;
    avatar: { src: string };
    raw: Users;
}

export interface CommandGroup {
    id: string;
    label: string;
    items: CommandItem[];
}
