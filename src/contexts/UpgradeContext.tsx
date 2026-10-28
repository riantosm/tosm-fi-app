import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DeviceEventEmitter } from 'react-native';
import Config from 'react-native-config';
import UpgradeSheet from '@/components/organisms/UpgradeSheet';
import {
  PLAN_LIMIT_EVENT,
  PLAN_LIMITS,
  PRO_LIFETIME_PRICE,
  type PlanLimitEventDetail,
} from '@/constants/plans';
import { navigationRef } from '@/navigation/navigationRef';
import { ROUTES } from '@/navigation/paths';
import { getMeApi } from '@/services/api/auth.service';
import { getPlanInfoApi } from '@/services/api/plan.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { onSetUser } from '@/store/slices/authSlice';
import type { PlanFeature, PlanInfo, PlanLimits, UserPlan } from '@/types';

type CountedFeature =
  | 'wallets'
  | 'categories'
  | 'budgets'
  | 'schedules'
  | 'instruments';
type ProFeature =
  | 'subCategories'
  | 'monthlyTrend'
  | 'customReportRange'
  | 'exportPdfExcel'
  | 'receiptScan';

const PRO_FEATURE_REASON: Record<ProFeature, PlanFeature> = {
  subCategories: 'subCategories',
  monthlyTrend: 'monthlyTrend',
  customReportRange: 'reportRange',
  exportPdfExcel: 'export',
  receiptScan: 'receiptScan',
};

const IS_SANDBOX = Config.MIDTRANS_IS_PRODUCTION !== 'true';

interface UpgradeContextValue {
  plan: UserPlan;
  isPro: boolean;
  limits: PlanLimits;
  info: PlanInfo | null;
  openUpgrade: (feature?: PlanFeature) => void;
  /** false (dan membuka sheet Upgrade) kalau `count` sudah mencapai batas paket. */
  guardLimit: (feature: CountedFeature, count: number) => boolean;
  /** false (dan membuka sheet Upgrade) kalau fitur tidak ada di paket. */
  guardPro: (feature: ProFeature) => boolean;
  /** Baca ulang user (badge paket) + info paket, mis. setelah pembayaran. */
  refreshPlan: () => Promise<void>;
}

const UpgradeContext = createContext<UpgradeContextValue | null>(null);

/**
 * Paket Free/Pro (sama dengan UpgradeProvider web): info paket, guard sebelum membuka form,
 * dan satu sheet Upgrade. Sheet juga terbuka untuk 403 PLAN_LIMIT dari request mana pun.
 */
export function UpgradeProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const isLogin = useAppSelector(state => state.auth.isLogin);
  const userPlan = useAppSelector(state => state.auth.user?.plan);
  const [info, setInfo] = useState<PlanInfo | null>(null);
  const [visible, setVisible] = useState(false);
  const [feature, setFeature] = useState<PlanFeature | null>(null);

  const plan: UserPlan = info?.plan ?? userPlan ?? 'free';
  const limits = info?.limits ?? PLAN_LIMITS[plan];

  const loadPlan = useCallback(async () => {
    setInfo(await getPlanInfoApi());
  }, []);

  useEffect(() => {
    if (isLogin) {
      loadPlan().catch(() => {});
    } else {
      setInfo(null);
    }
  }, [isLogin, loadPlan]);

  const refreshPlan = useCallback(async () => {
    dispatch(onSetUser(await getMeApi()));
    await loadPlan();
  }, [dispatch, loadPlan]);

  const openUpgrade = useCallback((reason?: PlanFeature) => {
    setFeature(reason ?? null);
    setVisible(true);
  }, []);

  // Request yang tidak di-guard di depan tetap sampai sini (axiosInstance).
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      PLAN_LIMIT_EVENT,
      (detail?: PlanLimitEventDetail) => {
        openUpgrade(detail?.feature);
        loadPlan().catch(() => {});
      },
    );
    return () => subscription.remove();
  }, [openUpgrade, loadPlan]);

  const value = useMemo<UpgradeContextValue>(
    () => ({
      plan,
      isPro: plan === 'pro',
      limits,
      info,
      openUpgrade,
      guardLimit: (key, count) => {
        const limit = limits[key];
        if (limit === null || count < limit) {
          return true;
        }
        openUpgrade(key);
        return false;
      },
      guardPro: key => {
        if (limits[key]) {
          return true;
        }
        openUpgrade(PRO_FEATURE_REASON[key]);
        return false;
      },
      refreshPlan,
    }),
    [plan, limits, info, openUpgrade, refreshPlan],
  );

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <UpgradeSheet
        visible={visible && isLogin}
        isPro={plan === 'pro'}
        feature={feature}
        limits={limits}
        price={info?.proLifetimePrice ?? PRO_LIFETIME_PRICE}
        isSandbox={IS_SANDBOX}
        onClose={() => setVisible(false)}
        onPay={() => {
          setVisible(false);
          if (navigationRef.isReady()) {
            navigationRef.navigate(ROUTES.PRO_CHECKOUT);
          }
        }}
      />
    </UpgradeContext.Provider>
  );
}

export function useUpgrade() {
  const context = useContext(UpgradeContext);
  if (!context) {
    throw new Error('useUpgrade harus dipakai di dalam UpgradeProvider');
  }
  return context;
}
