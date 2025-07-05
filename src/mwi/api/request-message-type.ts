export interface BuyMooPassWithCowbells {
    type: "buy_moo_pass_with_cowbells"
    buyMooPassWithCowbellsData: {
        quantity: number
    }
}

export interface ClaimAllMarketListings {
    type: "claim_all_market_listings",
}

export interface ClaimMarketListing {
    type: "claim_market_listing",
    claimMarketListingData: {
        marketListingId: string
    }
}

export interface ClaimCharacterQuest {
    type: "claim_character_quest",
    claimCharacterQuestData: {
        characterQuestId: number
    }
}

export interface OpenLoot {
    type: "open_loot",
    openLootData: {
        count: number,
        itemHash: string,
    }
}

export interface PostMarketOrder {
    type: "post_market_order",
    postMarketOrderData: {
        itemHrid: string
        price: number
        quantity: number
        enhancementLevel: number
        isInstantOrder: boolean
        isSell: boolean
    }
}
