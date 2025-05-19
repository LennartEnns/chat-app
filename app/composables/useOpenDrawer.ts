export const useOpenDrawer = () => {
    return useState<boolean>('drawerOpen', () => false);
  };