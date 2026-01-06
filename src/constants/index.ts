import { Project, ProjectCategory, LinkType } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Just Elegance',
    description: 'E-Commerce Web platform design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Web', 'Other'],
    links: [{ id: 'l1', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '2',
    name: 'Sneak Peek',
    description: 'Mobile E-Commerce app featuring Motion Design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Mobile', 'Motion Design'],
    links: [{ id: 'l2', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '3',
    name: 'Market Munch',
    description: 'Mobile E-Commerce application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Mobile', 'Other'],
    links: [{ id: 'l3', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '4',
    name: 'Activibe',
    description: 'Mobile Fitness application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Fitness', 'Mobile', 'Other'],
    links: [{ id: 'l4', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '5',
    name: 'LearnWise',
    description: 'Education platform for Web and Mobile.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Education', 'Web', 'Mobile', 'Other'],
    links: [{ id: 'l5', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '6',
    name: 'Cipher Star',
    description: 'FinTech Web platform with Vibrant Fluorescent Colors.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['FinTech', 'Web', 'Vibrant Fluorescent Colors'],
    links: [{ id: 'l6', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '7',
    name: 'FinFlex',
    description: 'Desktop FinTech dashboard in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['FinTech', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l7', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '8',
    name: 'Roam Rover',
    description: 'Travel Hospitality mobile application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Travel Hospitality', 'Mobile', 'Other'],
    links: [{ id: 'l8', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '9',
    name: 'Animania',
    description: 'Entertainment mobile app in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Entertainment', 'Mobile', 'Dark Mode'],
    links: [{ id: 'l9', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '10',
    name: 'Tune Trek',
    description: 'Mobile Entertainment application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Entertainment', 'Mobile', 'Other'],
    links: [{ id: 'l10', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '11',
    name: 'Home Seek',
    description: 'Real Estate Web platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Real Estate', 'Web', 'Other'],
    links: [{ id: 'l11', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '12',
    name: 'Flavor Swift',
    description: 'Food & Beverages Web platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Food & Beverages', 'Web', 'Other'],
    links: [{ id: 'l12', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '13',
    name: 'Foodie.',
    description: 'Food & Beverages Web platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Food & Beverages', 'Web', 'Other'],
    links: [{ id: 'l13', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '14',
    name: 'Gear Craft',
    description: 'Automotive Web platform with Vibrant Fluorescent Colors.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Automotive', 'Web', 'Vibrant Fluorescent Colors'],
    links: [{ id: 'l14', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '15',
    name: 'Cloud Watch',
    description: 'Weather Forecasting mobile app featuring Neuomorphism Design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Weather Forecasting', 'Mobile', 'Neuomorphism Design'],
    links: [{ id: 'l15', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '16',
    name: 'CarBid',
    description: 'Automotive platform for Web and Mobile.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Automotive', 'Web', 'Mobile', 'Other'],
    links: [{ id: 'l16', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '17',
    name: 'GlamourLux',
    description: 'E-Commerce platform for Web and Mobile.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Web', 'Mobile', 'Other'],
    links: [{ id: 'l17', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '18',
    name: 'MedAssist',
    description: 'Healthcare platform for Web and Mobile.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Healthcare', 'Web', 'Mobile', 'Other'],
    links: [{ id: 'l18', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '19',
    name: 'Bank Saver',
    description: 'SaaS App for Mobile banking.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['SaaS App', 'Mobile', 'Other'],
    links: [{ id: 'l19', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '20',
    name: 'TravelGo',
    description: 'Travel Hospitality Web platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Travel Hospitality', 'Web', 'Other'],
    links: [{ id: 'l20', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '21',
    name: 'Skillz',
    description: 'Education Web platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Education', 'Web', 'Other'],
    links: [{ id: 'l21', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '22',
    name: 'Learner',
    description: 'Mobile Education application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Education', 'Mobile', 'Other'],
    links: [{ id: 'l22', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '23',
    name: 'Home Harbor',
    description: 'Real Estate Web platform with Abstract Gradients.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Real Estate', 'Web', 'Abstract Gradients'],
    links: [{ id: 'l23', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '24',
    name: 'GLUX-Admin',
    description: 'SaaS App Desktop dashboard in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['SaaS App', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l24', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '25',
    name: 'Cashify',
    description: 'SaaS App Web platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['SaaS App', 'Web', 'Other'],
    links: [{ id: 'l25', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '26',
    name: 'Rare Canvas',
    description: 'SaaS App Web platform with Vibrant Fluorescent Colors.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['SaaS App', 'Web', 'Vibrant Fluorescent Colors'],
    links: [{ id: 'l26', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '27',
    name: 'Gamez',
    description: 'SaaS App Web platform with Vibrant Fluorescent Colors.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['SaaS App', 'Web', 'Vibrant Fluorescent Colors'],
    links: [{ id: 'l27', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '28',
    name: 'VCAN',
    description: 'Mobile Charity App.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Charity App', 'Mobile', 'Other'],
    links: [{ id: 'l28', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '29',
    name: 'Brandy',
    description: 'Furniture Website with Scrolling Animations.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Furniture Website', 'Web', 'Scrolling Animations'],
    links: [{ id: 'l29', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '30',
    name: 'Static',
    description: 'Luxury Shop Desktop platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Luxury Shop', 'Desktop', 'Other'],
    links: [{ id: 'l30', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '31',
    name: 'Shopper',
    description: 'Luxury Shop Mobile application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Luxury Shop', 'Mobile', 'Other'],
    links: [{ id: 'l31', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '32',
    name: 'Ride With Me',
    description: 'Mobile Ride Booking App.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['Ride Booking App', 'Mobile', 'Other'],
    links: [{ id: 'l32', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '33',
    name: 'Box Office',
    description: 'Online ticketing system mobile app with Neuomorphism Design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Online ticketing system', 'Mobile', 'Neuomorphism Design'],
    links: [{ id: 'l33', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '34',
    name: 'Aura',
    description: 'SaaS App Web platform with Neuomorphism Design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['SaaS App', 'Web', 'Neuomorphism Design'],
    links: [{ id: 'l34', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '35',
    name: 'Kick Start',
    description: 'Fitness Web platform in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Fitness', 'Web', 'Dark Mode'],
    links: [{ id: 'l35', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '36',
    name: 'E-Com',
    description: 'E-Commerce Web platform with Vibrant Fluorescent Colors.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Web', 'Vibrant Fluorescent Colors'],
    links: [{ id: 'l36', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '37',
    name: 'CareerCrafters',
    description: 'FinTech Web platform with Motion Design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['FinTech', 'Web', 'Motion Design'],
    links: [{ id: 'l37', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '38',
    name: 'Neubrutalistic Design',
    description: 'E-Commerce Web platform with Gen Z Graphic Design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Web', 'Gen Z Graphic Design'],
    links: [{ id: 'l38', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '39',
    name: 'Incarnate AI',
    description: 'Entertainment mobile app with AI Graphics.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['Entertainment', 'Mobile', 'AI Graphics'],
    links: [{ id: 'l39', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '40',
    name: 'Doctor Appointment',
    description: 'Mobile Healthcare application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['Healthcare', 'Mobile', 'Other'],
    links: [{ id: 'l40', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '41',
    name: 'E-learning',
    description: 'Mobile Education app with Micro-Animations.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Education', 'Mobile', 'Micro-Animations'],
    links: [{ id: 'l41', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '42',
    name: 'Shop Rank',
    description: 'Mobile E-Commerce application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['E-Commerce', 'Mobile', 'Other'],
    links: [{ id: 'l42', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '43',
    name: 'Afi Cash',
    description: 'Mobile FinTech application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['FinTech', 'Mobile', 'Other'],
    links: [{ id: 'l43', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '44',
    name: 'Gharr For Sale',
    description: 'Mobile Real Estate application.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['Real Estate', 'Mobile', 'Other'],
    links: [{ id: 'l44', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '45',
    name: 'Lelysium Buillder',
    description: 'Real Estate Web platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['Real Estate', 'Web', 'Other'],
    links: [{ id: 'l45', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '46',
    name: 'E-com Dahsboard',
    description: 'Desktop E-Commerce dashboard in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l46', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '47',
    name: 'Static',
    description: 'Desktop E-Commerce platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Desktop', 'Other'],
    links: [{ id: 'l47', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '48',
    name: 'Your Credit Profile',
    description: 'Desktop FinTech application in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['FinTech', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l48', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '49',
    name: 'CareerTail',
    description: 'Desktop Education platform in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['Education', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l49', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '50',
    name: 'NurseBridge',
    description: 'Desktop Healthcare platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['Healthcare', 'Desktop', 'Other'],
    links: [{ id: 'l50', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '51',
    name: 'Deviant .io',
    description: 'Desktop FinTech platform in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['FinTech', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l51', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '52',
    name: 'True Elements',
    description: 'Desktop FinTech platform in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['FinTech', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l52', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '53',
    name: 'Stock App',
    description: 'Desktop FinTech application in Dark Mode.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['FinTech', 'Desktop', 'Dark Mode'],
    links: [{ id: 'l53', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '54',
    name: 'NftSelling',
    description: 'Mobile FinTech app with Gen Z Graphic Design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['FinTech', 'Mobile', 'Gen Z Graphic Design'],
    links: [{ id: 'l54', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '55',
    name: 'LT Tracking',
    description: 'Desktop E-Commerce platform.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Mustaqeem',
    tags: ['E-Commerce', 'Desktop', 'Other'],
    links: [{ id: 'l55', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '56',
    name: 'Product Page',
    description: 'E-Commerce Web page design.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['E-Commerce', 'Web', 'Other'],
    links: [{ id: 'l56', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '57',
    name: 'Get Help',
    description: 'Healthcare Web platform with Doodles and Line Art.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Healthcare', 'Web', 'Doodles and Line Art Illustrations'],
    links: [{ id: 'l57', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  },
  {
    id: '58',
    name: 'BookWorms',
    description: 'Mobile Entertainment app with Vibrant Fluorescent Colors.',
    category: ProjectCategory.UXUI,
    profileOwner: 'Zainab',
    tags: ['Entertainment', 'Mobile', 'Vibrant Fluorescent Colors'],
    links: [{ id: 'l58', label: 'Go To Design', url: 'https://www.figma.com/', type: LinkType.FIGMA }],
    lastModified: Date.now()
  }
];

export const CATEGORY_OPTIONS = Object.values(ProjectCategory);
export const LINK_TYPE_OPTIONS = Object.values(LinkType);
