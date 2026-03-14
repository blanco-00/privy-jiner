import Database from 'better-sqlite3';
export interface WardrobeItem {
    id: string;
    name: string;
    category: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory' | 'other';
    color?: string;
    brand?: string;
    season?: string[];
    favorite: boolean;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Outfit {
    id: string;
    name: string;
    itemIds: string[];
    rating?: number;
    occasions?: string[];
    weather?: string[];
    notes?: string;
    createdAt: Date;
}
export interface CapsuleWardrobe {
    id: string;
    name: string;
    description?: string;
    itemIds: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface StylePreference {
    id: string;
    key: string;
    value: string;
    updatedAt: Date;
}
export declare class FashionManager {
    private db;
    constructor(db: Database.Database);
    private initSchema;
    addItem(item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>): WardrobeItem;
    getItem(id: string): WardrobeItem | undefined;
    listItems(filter?: {
        category?: string;
        favorite?: boolean;
        season?: string;
    }): WardrobeItem[];
    updateItem(id: string, updates: Partial<Pick<WardrobeItem, 'name' | 'category' | 'color' | 'brand' | 'season' | 'favorite' | 'imageUrl'>>): WardrobeItem | undefined;
    deleteItem(id: string): boolean;
    logOutfit(outfit: Omit<Outfit, 'id' | 'createdAt'>): Outfit;
    getOutfit(id: string): Outfit | undefined;
    listOutfits(limit?: number): Outfit[];
    rateOutfit(id: string, rating: number): Outfit | undefined;
    createCapsule(capsule: Omit<CapsuleWardrobe, 'id' | 'createdAt' | 'updatedAt'>): CapsuleWardrobe;
    getCapsule(id: string): CapsuleWardrobe | undefined;
    listCapsules(): CapsuleWardrobe[];
    generateCombinations(capsuleId: string, maxOutfits?: number): string[][];
    setStylePreference(key: string, value: string): StylePreference;
    getStylePreference(key: string): StylePreference | undefined;
    getAllStylePreferences(): StylePreference[];
    private mapRowToItem;
    private mapRowToOutfit;
    private mapRowToCapsule;
    private mapRowToStylePreference;
}
//# sourceMappingURL=index.d.ts.map