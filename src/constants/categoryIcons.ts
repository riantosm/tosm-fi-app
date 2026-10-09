import {
  Apple,
  Archive,
  BadgePercent,
  Banknote,
  Bike,
  Briefcase,
  Building2,
  Bus,
  Camera,
  Car,
  CarTaxiFront,
  ChartColumn,
  ChartPie,
  CircleDollarSign,
  CircleDot,
  CircleHelp,
  CirclePlay,
  Clapperboard,
  ClipboardList,
  Coffee,
  Coins,
  CreditCard,
  Croissant,
  Droplets,
  FileText,
  Flag,
  Flame,
  Flower2,
  Folder,
  Fuel,
  Gamepad2,
  Gem,
  Gift,
  HandCoins,
  HandHeart,
  Hospital,
  House,
  IceCreamCone,
  Joystick,
  Landmark,
  Leaf,
  Map,
  MapPin,
  MonitorSmartphone,
  Music,
  PawPrint,
  Phone,
  Pizza,
  Puzzle,
  QrCode,
  ReceiptText,
  Repeat,
  Rocket,
  Sandwich,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Signal,
  Smile,
  Sofa,
  Star,
  Tag,
  ThumbsUp,
  Ticket,
  TrainFront,
  TrendingUp,
  Trophy,
  Truck,
  Users,
  Utensils,
  UtensilsCrossed,
  Video,
  Wallet,
  WalletCards,
  Watch,
  Wifi,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

// Stored icon names (`name`) are persisted in the backend and must never change —
// they keep their original react-icons identifiers; only the rendered glyph maps
// to the Lucide set used by the Mist design.
export interface CategoryIconOption {
  name: string;
  icon: LucideIcon;
  labelKey: string;
}

export interface CategoryIconGroup {
  key: string;
  titleKey: string;
  icons: CategoryIconOption[];
}

export const CATEGORY_ICON_GROUPS: CategoryIconGroup[] = [
  {
    key: 'general',
    titleKey: 'category.iconGroups.general',
    icons: [
      { name: 'HiOutlineTag', icon: Tag, labelKey: 'tag' },
      { name: 'HiOutlineStar', icon: Star, labelKey: 'star' },
      { name: 'HiOutlineFolder', icon: Folder, labelKey: 'folder' },
      { name: 'HiOutlineArchiveBox', icon: Archive, labelKey: 'archive' },
      {
        name: 'HiOutlineClipboardDocumentList',
        icon: ClipboardList,
        labelKey: 'checklist',
      },
      { name: 'HiOutlineFlag', icon: Flag, labelKey: 'flag' },
      {
        name: 'HiOutlineQuestionMarkCircle',
        icon: CircleHelp,
        labelKey: 'other',
      },
      { name: 'HiOutlineDocumentText', icon: FileText, labelKey: 'document' },
    ],
  },
  {
    key: 'food',
    titleKey: 'category.iconGroups.food',
    icons: [
      { name: 'IoFastFoodOutline', icon: Sandwich, labelKey: 'food' },
      {
        name: 'MdOutlineRestaurant',
        icon: UtensilsCrossed,
        labelKey: 'restaurant',
      },
      { name: 'MdOutlineFlatware', icon: Utensils, labelKey: 'cutlery' },
      { name: 'MdOutlineLocalCafe', icon: Coffee, labelKey: 'cafe' },
      { name: 'MdOutlineBakeryDining', icon: Croissant, labelKey: 'bakery' },
      { name: 'MdOutlineLocalPizza', icon: Pizza, labelKey: 'pizza' },
      { name: 'MdOutlineIcecream', icon: IceCreamCone, labelKey: 'dessert' },
      { name: 'HiOutlineFire', icon: Flame, labelKey: 'cooking' },
      { name: 'MdOutlineEco', icon: Leaf, labelKey: 'vegetable' },
      { name: 'MdOutlineLocalGroceryStore', icon: Apple, labelKey: 'produce' },
    ],
  },
  {
    key: 'dailyNeeds',
    titleKey: 'category.iconGroups.dailyNeeds',
    icons: [
      { name: 'MdOutlineCheckroom', icon: Shirt, labelKey: 'clothing' },
      { name: 'HiOutlineWifi', icon: Wifi, labelKey: 'internet' },
      {
        name: 'HiOutlineShoppingCart',
        icon: ShoppingCart,
        labelKey: 'groceries',
      },
      {
        name: 'HiOutlineShoppingBag',
        icon: ShoppingBag,
        labelKey: 'shoppingBag',
      },
      { name: 'MdOutlineWatch', icon: Watch, labelKey: 'accessories' },
      { name: 'MdOutlineDiamond', icon: Gem, labelKey: 'jewelry' },
      { name: 'HiOutlineHome', icon: House, labelKey: 'home' },
      { name: 'HiOutlineHomeModern', icon: Sofa, labelKey: 'household' },
      { name: 'HiOutlineBolt', icon: Zap, labelKey: 'electricity' },
      { name: 'HiOutlinePhone', icon: Phone, labelKey: 'phoneBill' },
      { name: 'HiOutlineWrenchScrewdriver', icon: Wrench, labelKey: 'repair' },
      {
        name: 'HiOutlineReceiptPercent',
        icon: BadgePercent,
        labelKey: 'discount',
      },
      { name: 'HiOutlineTicket', icon: Ticket, labelKey: 'voucher' },
      { name: 'HiOutlineGiftTop', icon: Gift, labelKey: 'giftBox' },
      {
        name: 'MdOutlineDevices',
        icon: MonitorSmartphone,
        labelKey: 'electronics',
      },
      { name: 'MdOutlineSimCard', icon: Signal, labelKey: 'mobileData' },
    ],
  },
  {
    key: 'transport',
    titleKey: 'category.iconGroups.transport',
    icons: [
      { name: 'MdOutlineDirectionsCar', icon: Car, labelKey: 'car' },
      { name: 'MdOutlineTwoWheeler', icon: Bike, labelKey: 'motorcycle' },
      { name: 'MdOutlineDirectionsBus', icon: Bus, labelKey: 'bus' },
      { name: 'MdOutlineLocalGasStation', icon: Fuel, labelKey: 'fuel' },
      { name: 'MdOutlineLocalTaxi', icon: CarTaxiFront, labelKey: 'taxi' },
      { name: 'HiOutlineMapPin', icon: MapPin, labelKey: 'location' },
      { name: 'HiOutlineMap', icon: Map, labelKey: 'route' },
      { name: 'HiOutlineTruck', icon: Truck, labelKey: 'delivery' },
      { name: 'MdOutlineTrain', icon: TrainFront, labelKey: 'train' },
      { name: 'MdOutlineLocalCarWash', icon: Droplets, labelKey: 'carWash' },
    ],
  },
  {
    key: 'hobby',
    titleKey: 'category.iconGroups.hobby',
    icons: [
      { name: 'MdOutlineSportsEsports', icon: Gamepad2, labelKey: 'esports' },
      {
        name: 'MdOutlineVideogameAsset',
        icon: Joystick,
        labelKey: 'gameTopup',
      },
      { name: 'HiOutlinePuzzlePiece', icon: Puzzle, labelKey: 'games' },
      { name: 'HiOutlineMusicalNote', icon: Music, labelKey: 'music' },
      { name: 'HiOutlineFilm', icon: Clapperboard, labelKey: 'movie' },
      { name: 'HiOutlineCamera', icon: Camera, labelKey: 'photography' },
      { name: 'HiOutlineTrophy', icon: Trophy, labelKey: 'sports' },
      { name: 'HiOutlinePlayCircle', icon: CirclePlay, labelKey: 'streaming' },
      { name: 'HiOutlineVideoCamera', icon: Video, labelKey: 'video' },
      { name: 'MdOutlinePool', icon: CircleDot, labelKey: 'billiard' },
      { name: 'MdOutlineVapingRooms', icon: Wind, labelKey: 'vape' },
    ],
  },
  {
    key: 'paymentOther',
    titleKey: 'category.iconGroups.paymentOther',
    icons: [
      { name: 'HiOutlineCreditCard', icon: CreditCard, labelKey: 'creditCard' },
      {
        name: 'MdOutlineCreditScore',
        icon: WalletCards,
        labelKey: 'debitCard',
      },
      { name: 'HiOutlineBanknotes', icon: Banknote, labelKey: 'cash' },
      { name: 'HiOutlineQrCode', icon: QrCode, labelKey: 'digitalPayment' },
      { name: 'HiOutlineWallet', icon: Wallet, labelKey: 'wallet' },
      { name: 'HiOutlineBuildingLibrary', icon: Landmark, labelKey: 'bank' },
      { name: 'HiOutlineReceiptRefund', icon: ReceiptText, labelKey: 'refund' },
      { name: 'MdOutlinePayments', icon: HandCoins, labelKey: 'payment' },
      {
        name: 'MdOutlineSubscriptions',
        icon: Repeat,
        labelKey: 'subscription',
      },
    ],
  },
  {
    key: 'investment',
    titleKey: 'category.iconGroups.investment',
    icons: [
      { name: 'HiOutlineChartPie', icon: ChartPie, labelKey: 'investment' },
      { name: 'HiOutlineChartBar', icon: ChartColumn, labelKey: 'chart' },
      {
        name: 'HiOutlineArrowTrendingUp',
        icon: TrendingUp,
        labelKey: 'profit',
      },
      {
        name: 'HiOutlineCurrencyDollar',
        icon: CircleDollarSign,
        labelKey: 'money',
      },
      { name: 'HiOutlineBriefcase', icon: Briefcase, labelKey: 'job' },
      { name: 'HiOutlineRocketLaunch', icon: Rocket, labelKey: 'business' },
      { name: 'HiOutlineHandThumbUp', icon: ThumbsUp, labelKey: 'bonus' },
      { name: 'MdOutlineCurrencyExchange', icon: Coins, labelKey: 'exchange' },
      { name: 'HiOutlineBuildingOffice', icon: Building2, labelKey: 'office' },
    ],
  },
  {
    key: 'health',
    titleKey: 'category.iconGroups.health',
    icons: [
      { name: 'MdOutlineLocalHospital', icon: Hospital, labelKey: 'health' },
      { name: 'MdOutlineSpa', icon: Flower2, labelKey: 'spa' },
      { name: 'MdOutlineFace', icon: Smile, labelKey: 'skincare' },
      { name: 'MdOutlinePets', icon: PawPrint, labelKey: 'pet' },
    ],
  },
  {
    key: 'social',
    titleKey: 'category.iconGroups.social',
    icons: [
      { name: 'HiOutlineUserGroup', icon: Users, labelKey: 'social' },
      {
        name: 'MdOutlineVolunteerActivism',
        icon: HandHeart,
        labelKey: 'donation',
      },
    ],
  },
];

export const CATEGORY_ICONS: CategoryIconOption[] =
  CATEGORY_ICON_GROUPS.flatMap(group => group.icons);

export function resolveCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS.find(option => option.name === name)?.icon ?? Tag;
}
