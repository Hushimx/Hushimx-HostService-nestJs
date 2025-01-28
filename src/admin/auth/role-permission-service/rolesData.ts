export enum Permission {
    VIEW_ADMINS = 'admins:read',
    CREATE_ADMINS = 'admins:create',
    EDIT_ADMINS = 'admins:update',
    DELETE_ADMINS = 'admins:delete',
    VIEW_HOTELS = 'view:hotels', // Permission to view hotels
    ACCESS_ALL_HOTELS = 'accessAll:hotels', // Full access to all operations
    CREATE_HOTELS = 'create:hotels',
    EDIT_HOTELS = 'edit:hotels',
    DELETE_HOTELS = 'delete:hotels',
    ACCESS_ALL_VENDORS = 'accessAll:vendors',
    CREATE_VENDORS = 'create:vendors',
    EDIT_VENDORS = 'edit:vendors',
    DELETE_VENDORS = 'delete:vendors',
    VIEW_VENDORS = 'view:vendors',
    ACCESS_ALL_PRODUCTS = 'accessAll:products',
    VIEW_PRODUCTS = 'view:products',
    CREATE_PRODUCTS = 'create:products',
    EDIT_PRODUCTS = 'edit:products',
    DELETE_PRODUCTS = 'delete:products',
    ACCESS_ALL_ORDERS = 'accessAll:orders',
    ACCESS_OVERVIEW = 'accessOverview',
    //CITIES
    ACCESS_ALL_CITIES = 'accessAll:cities',
    VIEW_CITIES = 'view:cities',
    CREATE_CITIES = 'create:cities',
    EDIT_CITIES = 'edit:cities',
    DELETE_CITIES = 'delete:cities',
    //orders
    VIEW_ORDERS = 'view:orders',    
    CREATE_ORDERS = 'create:orders',
    EDIT_ORDERS = 'edit:orders',
    DELETE_ORDERS = 'delete:orders',
    //service 
    VIEW_SERVICES = 'view:serviceOrders',    
    CREATE_SERVICES = 'create:serviceOrders',
    EDIT_SERVICES = 'edit:serviceOrders',
    DELETE_SERVICES = 'delete:serviceOrders',
    //Service Orders
    VIEW_SERVICE_ORDERS = 'view:serviceOrders',    
    CREATE_SERVICE_ORDERS = 'create:serviceOrders',
    EDIT_SERVICE_ORDERS = 'edit:serviceOrders',
    DELETE_SERVICE_ORDERS = 'delete:serviceOrders',
    //Categories
    VIEW_CATEGORIES = 'view:categories',    
    CREATE_CATEGORIES = 'create:categories',
    EDIT_CATEGORIES = 'edit:categories',
    DELETE_CATEGORIES = 'delete:categories',
    //Drivers
    VIEW_DRIVERS = 'view:drivers',
    CREATE_DRIVERS = 'create:drivers',
    EDIT_DRIVERS = 'edit:drivers',
    DELETE_DRIVERS = 'delete:drivers',
    //stores
    VIEW_STORES = 'view:stores',
    CREATE_STORES = 'create:stores',
    EDIT_STORES = 'edit:stores',
    DELETE_STORES = 'delete:stores',
    //sections
    VIEW_SECTIONS = 'view:sections',
    MANAGE_SECTIONS = 'managae:sections',
    DELETE_SECTIONS = 'delete:sections',
    //Clients 
    ACCESS_ALL_CLIENTS = 'accessAll:clients',
    VIEW_CLIENTS = 'view:clients',
    MANAGE_CLIENTS = 'managae:clients',
    DELETE_CLIENTS = 'delete:clients',
    //events
    VIEW_EVENTS = 'view:events',
    MANAGE_EVENTS = 'managae:events',
    DELETE_EVENTS = 'delete:events',

      }
  
  export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    REGIONAL_ADMIN = 'REGIONAL_ADMIN',
  }
  export const RolePermissions: Record<Role, Permission[]> = {
    [Role.SUPER_ADMIN]: [
      //Admins
      Permission.VIEW_ADMINS,
      Permission.CREATE_ADMINS,
      Permission.EDIT_ADMINS, 
      Permission.DELETE_ADMINS,
      //Hotels
      Permission.ACCESS_ALL_HOTELS,
      Permission.VIEW_HOTELS,
      Permission.CREATE_HOTELS,
      Permission.EDIT_HOTELS,
      Permission.DELETE_HOTELS,
      //vendors
      Permission.ACCESS_ALL_VENDORS,
      Permission.VIEW_VENDORS,
      Permission.CREATE_VENDORS,
      Permission.EDIT_VENDORS,
      Permission.DELETE_VENDORS,
      //Products
      Permission.ACCESS_ALL_PRODUCTS,
      Permission.VIEW_PRODUCTS,
      Permission.CREATE_PRODUCTS,
      Permission.EDIT_PRODUCTS,
      Permission.DELETE_PRODUCTS,
      //Orders
      Permission.ACCESS_ALL_ORDERS,
      Permission.VIEW_ORDERS,
      Permission.CREATE_ORDERS,
      Permission.EDIT_ORDERS,
      Permission.DELETE_ORDERS,
      //Services
      Permission.VIEW_SERVICES,
      Permission.CREATE_SERVICES,
      Permission.EDIT_SERVICES,
      Permission.DELETE_SERVICES,
      //Service Orders
      Permission.VIEW_SERVICE_ORDERS,
      Permission.CREATE_SERVICE_ORDERS,
      Permission.EDIT_SERVICE_ORDERS,
      Permission.DELETE_SERVICE_ORDERS,
      //drivers
      Permission.VIEW_DRIVERS,
      Permission.CREATE_DRIVERS,
      Permission.EDIT_DRIVERS,
      Permission.DELETE_DRIVERS,
      //stores
      Permission.VIEW_STORES,
      Permission.CREATE_STORES,
      Permission.EDIT_STORES,
      Permission.DELETE_STORES,
      //Section
      Permission.VIEW_SECTIONS,
      Permission.MANAGE_SECTIONS,
      //Clients
      Permission.VIEW_CLIENTS,
      Permission.MANAGE_CLIENTS,
      Permission.DELETE_CLIENTS,
      //Events
      Permission.VIEW_EVENTS,
      Permission.MANAGE_EVENTS,
      Permission.DELETE_EVENTS,
      //Cities
      Permission.ACCESS_ALL_CITIES,
      Permission.VIEW_CITIES,
      Permission.CREATE_CITIES,
      Permission.EDIT_CITIES,
      Permission.DELETE_CITIES,
      Permission.ACCESS_OVERVIEW


      
  
    ],
    [Role.REGIONAL_ADMIN]: [
    //Hotels
    Permission.VIEW_HOTELS,
    Permission.CREATE_HOTELS,
    Permission.EDIT_HOTELS,
    Permission.DELETE_HOTELS,
    //vendors
    Permission.VIEW_VENDORS,
    Permission.CREATE_VENDORS,
    Permission.EDIT_VENDORS,
    Permission.DELETE_VENDORS,
    //Products
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    //Service Orders
    Permission.VIEW_SERVICE_ORDERS,
    Permission.CREATE_SERVICE_ORDERS,
    Permission.EDIT_SERVICE_ORDERS,
    Permission.DELETE_SERVICE_ORDERS,
    //Drivers
    Permission.VIEW_DRIVERS,
    Permission.CREATE_DRIVERS,
    Permission.EDIT_DRIVERS,
    Permission.DELETE_DRIVERS,
    //stores
    Permission.VIEW_STORES,
    Permission.CREATE_STORES,
    Permission.EDIT_STORES,
    Permission.DELETE_STORES,
    //Sections
    Permission.VIEW_SECTIONS,
    Permission.MANAGE_SECTIONS,
    //CLIENTS
    Permission.VIEW_CLIENTS,
    Permission.MANAGE_CLIENTS,
    Permission.DELETE_CLIENTS,
    //events
    Permission.VIEW_EVENTS,
    Permission.MANAGE_EVENTS,
    Permission.DELETE_EVENTS,
    //Cities
    Permission.VIEW_CITIES,
    Permission.CREATE_CITIES,
    Permission.EDIT_CITIES,
    Permission.DELETE_CITIES,
    //Overview
    Permission.ACCESS_OVERVIEW,
    Permission.VIEW_ORDERS




    
    ],
  };
  