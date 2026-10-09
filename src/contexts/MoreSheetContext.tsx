import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface MoreSheetActions {
  open: () => void;
  close: () => void;
}

const MoreSheetStateContext = createContext(false);
const MoreSheetActionsContext = createContext<MoreSheetActions>({
  open: () => {},
  close: () => {},
});

/**
 * State sheet Lainnya: dibuka dari slot bottom nav maupun avatar di hero Dashboard. State dan aksi
 * dipisah: layar yang hanya membuka sheet (Dashboard) memakai aksi yang stabil, jadi tidak ikut
 * dirender ulang setiap sheet dibuka/ditutup.
 */
export function MoreSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const actions = useMemo(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [],
  );
  return (
    <MoreSheetActionsContext.Provider value={actions}>
      <MoreSheetStateContext.Provider value={isOpen}>
        {children}
      </MoreSheetStateContext.Provider>
    </MoreSheetActionsContext.Provider>
  );
}

/** State + aksi (bottom nav yang merender sheet-nya). */
export function useMoreSheet() {
  const isOpen = useContext(MoreSheetStateContext);
  return { isOpen, ...useContext(MoreSheetActionsContext) };
}

/** Aksi saja (stabil) untuk pemicu sheet. */
export function useMoreSheetActions() {
  return useContext(MoreSheetActionsContext);
}
