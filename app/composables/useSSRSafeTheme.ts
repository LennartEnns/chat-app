export const useSSRSafeTheme = () => {
    const colorMode = useColorMode();
    const themeSSRCookie = useCookie('uiTheme');
    watch(colorMode, (mode) => {
        themeSSRCookie.value = mode.preference; // Keep cookie in sync with the mode from local storage
    });

    const preference = computed({
        get(): string {
            return themeSSRCookie.value || 'system';
        },
        set(val: 'light' | 'dark' | 'system') {
            colorMode.preference = val;
        },
    });

    const isLight = computed({
        get(): boolean {
            return (themeSSRCookie.value === "light");
        },
        set(val: boolean): void {
            colorMode.preference = (val ? "light" : "dark");
        },
    });
    
    return { preference, isLight };
}