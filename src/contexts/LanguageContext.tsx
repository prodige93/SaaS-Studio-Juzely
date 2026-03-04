import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation
    dashboard: "Dashboard",
    projects: "Projets",
    orders: "Commandes",
    samples: "Échantillons",
    factories: "Usines",
    production: "Production",
    analytics: "Analytics",
    settings: "Paramètres",
    
    // Common actions
    newProject: "Nouveau projet",
    search: "Rechercher...",
    navigation: "Navigation",
    
    // Dashboard
    totalProjects: "Projets totaux",
    activeOrders: "Commandes actives",
    completedSamples: "Échantillons terminés",
    factoryPartners: "Partenaires usines",
    recentProjects: "Projets récents",
    projectTimeline: "Chronologie des projets",
    dashboardDescription: "Vue d'ensemble de vos projets textiles",
    
    // Dashboard Stats
    totalProjectsCard: "Projets Total",
    allProjects: "Tous vos projets",
    inProgressCard: "En Cours",
    activeProjects: "Projets actifs",
    completedCard: "Terminés",
    finalizedProjects: "Projets finalisés",
    totalValueCard: "Valeur Totale",
    totalBudget: "Budget total",
    thisMonth: "ce mois",
    thisWeek: "cette semaine",
    vsLastMonth: "vs mois dernier",
    
    // Dashboard Tabs
    overview: "Vue d'ensemble",
    timeline: "Timeline",
    recentProjectsTab: "Projets Récents",
    searchProject: "Rechercher un projet...",
    viewAllProjects: "Voir tous les projets",
    noProjectFound: "Aucun projet trouvé",
    modifySearchOrCreate: "Essayez de modifier votre recherche ou créez un nouveau projet.",
    
    // Projects Page
    projectsTitle: "Projets",
    manageTextileProjects: "Gérez tous vos projets textiles",
    foundProjects: "projet trouvé",
    foundProjectsPlural: "projets trouvés",
    noProjectsFound: "Aucun projet trouvé",
    modifyFiltersOrCreate: "Essayez de modifier vos filtres ou créez un nouveau projet.",
    
    // Filters
    all: "Tous",
    draft: "Brouillons",
    inProgress: "En cours",
    review: "En révision",
    completed: "Terminés",
    cancelled: "Annulés",
    onHold: "En attente",
    allStatuses: "Tous les statuts",
    filterByStatus: "Filtrer par statut",
    allPriorities: "Toutes les priorités",
    filterByPriority: "Filtrer par priorité",
    
    // Priority
    low: "Faible",
    medium: "Moyenne",
    high: "Haute",
    urgent: "Urgente",
    
    // Project Card
    projectName: "Nom du projet",
    client: "Client",
    status: "Statut",
    type: "Type",
    deadline: "Échéance",
    actions: "Actions",
    viewDetails: "Voir les détails",
    modify: "Modifier",
    progress: "Progression",
    budget: "Budget",
    quantity: "Quantité",
    pcs: "pcs",
    
    // Common
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
    
    // Production Tracker
    productionSteps: "Étapes de Production",
    factory: "Usine",
    stepsComplete: "étapes",
    productionLabel: "Production",
    saved: "Sauvegardé",
    progressUpdated: "Progression mise à jour pour",
    saveError: "Erreur de sauvegarde",
    unableToSave: "Impossible de sauvegarder les modifications",
    
    // Production Step Names
    techPackChecking: "Fiche technique",
    fabricPurchase: "Achats matériaux",
    prewashFabric: "Prélavage tissus",
    fabricCut: "Découpe matière",
    printEmbroidery: "Ajout des logos",
    sewing: "Assemblage",
    qualityControl: "Contrôle qualité",
    shipping: "Transport",
    
    // Production Status
    completedStatus: "Terminé",
    inProgressStatus: "En cours",
    pendingStatus: "En attente",
    startedOn: "Commencé le",
    completedOn: "Terminé le",
    
    // Production Actions
    start: "Démarrer",
    finish: "Terminer",
    finishStep: "Terminer l'étape",
    addNotes: "Ajouter des notes (optionnel)...",
    confirm: "Confirmer",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    projects: "Projects",
    orders: "Orders",
    samples: "Samples",
    factories: "Factories",
    production: "Production",
    analytics: "Analytics",
    settings: "Settings",
    
    // Common actions
    newProject: "New project",
    search: "Search...",
    navigation: "Navigation",
    
    // Dashboard
    totalProjects: "Total Projects",
    activeOrders: "Active Orders",
    completedSamples: "Completed Samples",
    factoryPartners: "Factory Partners",
    recentProjects: "Recent Projects",
    projectTimeline: "Project Timeline",
    dashboardDescription: "Overview of your textile projects",
    
    // Dashboard Stats
    totalProjectsCard: "Total Projects",
    allProjects: "All your projects",
    inProgressCard: "In Progress",
    activeProjects: "Active projects",
    completedCard: "Completed",
    finalizedProjects: "Finalized projects",
    totalValueCard: "Total Value",
    totalBudget: "Total budget",
    thisMonth: "this month",
    thisWeek: "this week",
    vsLastMonth: "vs last month",
    
    // Dashboard Tabs
    overview: "Overview",
    timeline: "Timeline",
    recentProjectsTab: "Recent Projects",
    searchProject: "Search project...",
    viewAllProjects: "View all projects",
    noProjectFound: "No project found",
    modifySearchOrCreate: "Try modifying your search or create a new project.",
    
    // Projects Page
    projectsTitle: "Projects",
    manageTextileProjects: "Manage all your textile projects",
    foundProjects: "project found",
    foundProjectsPlural: "projects found",
    noProjectsFound: "No projects found",
    modifyFiltersOrCreate: "Try modifying your filters or create a new project.",
    
    // Filters
    all: "All",
    draft: "Drafts",
    inProgress: "In Progress",
    review: "Under Review",
    completed: "Completed",
    cancelled: "Cancelled",
    onHold: "On Hold",
    allStatuses: "All statuses",
    filterByStatus: "Filter by status",
    allPriorities: "All priorities",
    filterByPriority: "Filter by priority",
    
    // Priority
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    
    // Project Card
    projectName: "Project Name",
    client: "Client",
    status: "Status",
    type: "Type",
    deadline: "Deadline",
    actions: "Actions",
    viewDetails: "View details",
    modify: "Edit",
    progress: "Progress",
    budget: "Budget",
    quantity: "Quantity",
    pcs: "pcs",
    
    // Common
    edit: "Edit",
    delete: "Delete",
    view: "View",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    
    // Production Tracker
    productionSteps: "Production Steps",
    factory: "Factory",
    stepsComplete: "steps",
    productionLabel: "Production",
    saved: "Saved",
    progressUpdated: "Progress updated for",
    saveError: "Save Error",
    unableToSave: "Unable to save changes",
    
    // Production Step Names
    techPackChecking: "Tech Pack Checking",
    fabricPurchase: "Fabric/trims purchase",
    prewashFabric: "Prewash fabric",
    fabricCut: "Fabric cut",
    printEmbroidery: "Print / Embroidery",
    sewing: "Sewing",
    qualityControl: "Quality control",
    shipping: "Shipping",
    
    // Production Status
    completedStatus: "Completed",
    inProgressStatus: "In Progress",
    pendingStatus: "Pending",
    startedOn: "Started on",
    completedOn: "Completed on",
    
    // Production Actions
    start: "Start",
    finish: "Finish",
    finishStep: "Finish step",
    addNotes: "Add notes (optional)...",
    confirm: "Confirm",
  },
  zh: {
    // Navigation
    dashboard: "仪表板",
    projects: "项目",
    orders: "订单",
    samples: "样品",
    factories: "工厂",
    production: "生产",
    analytics: "分析",
    settings: "设置",
    
    // Common actions
    newProject: "新项目",
    search: "搜索...",
    navigation: "导航",
    
    // Dashboard
    totalProjects: "项目总数",
    activeOrders: "活跃订单",
    completedSamples: "完成样品",
    factoryPartners: "工厂合作伙伴",
    recentProjects: "最近项目",
    projectTimeline: "项目时间线",
    dashboardDescription: "纺织项目概览",
    
    // Dashboard Stats
    totalProjectsCard: "项目总数",
    allProjects: "所有项目",
    inProgressCard: "进行中",
    activeProjects: "活跃项目",
    completedCard: "已完成",
    finalizedProjects: "已完成项目",
    totalValueCard: "总价值",
    totalBudget: "总预算",
    thisMonth: "本月",
    thisWeek: "本周",
    vsLastMonth: "与上月对比",
    
    // Dashboard Tabs
    overview: "概览",
    timeline: "时间线",
    recentProjectsTab: "最近项目",
    searchProject: "搜索项目...",
    viewAllProjects: "查看所有项目",
    noProjectFound: "未找到项目",
    modifySearchOrCreate: "请修改搜索条件或创建新项目。",
    
    // Projects Page
    projectsTitle: "项目",
    manageTextileProjects: "管理所有纺织项目",
    foundProjects: "个项目",
    foundProjectsPlural: "个项目",
    noProjectsFound: "未找到项目",
    modifyFiltersOrCreate: "请修改筛选条件或创建新项目。",
    
    // Filters
    all: "全部",
    draft: "草稿",
    inProgress: "进行中",
    review: "审核中",
    completed: "已完成",
    cancelled: "已取消",
    onHold: "暂停",
    allStatuses: "所有状态",
    filterByStatus: "按状态筛选",
    allPriorities: "所有优先级",
    filterByPriority: "按优先级筛选",
    
    // Priority
    low: "低",
    medium: "中",
    high: "高",
    urgent: "紧急",
    
    // Project Card
    projectName: "项目名称",
    client: "客户",
    status: "状态",
    type: "类型",
    deadline: "截止日期",
    actions: "操作",
    viewDetails: "查看详情",
    modify: "修改",
    progress: "进度",
    budget: "预算",
    quantity: "数量",
    pcs: "件",
    
    // Common
    edit: "编辑",
    delete: "删除",
    view: "查看",
    save: "保存",
    cancel: "取消",
    close: "关闭",
    
    // Production Tracker
    productionSteps: "生产步骤",
    factory: "工厂",
    stepsComplete: "步骤",
    productionLabel: "生产",
    saved: "已保存",
    progressUpdated: "进度已更新",
    saveError: "保存错误",
    unableToSave: "无法保存更改",
    
    // Production Step Names
    techPackChecking: "技术包检查",
    fabricPurchase: "面料/辅料采购",
    prewashFabric: "面料预洗",
    fabricCut: "面料裁剪",
    printEmbroidery: "印花/刺绣",
    sewing: "缝制",
    qualityControl: "质量控制",
    shipping: "运输",
    
    // Production Status
    completedStatus: "已完成",
    inProgressStatus: "进行中",
    pendingStatus: "待处理",
    startedOn: "开始于",
    completedOn: "完成于",
    
    // Production Actions
    start: "开始",
    finish: "完成",
    finishStep: "完成步骤",
    addNotes: "添加备注（可选）...",
    confirm: "确认",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}