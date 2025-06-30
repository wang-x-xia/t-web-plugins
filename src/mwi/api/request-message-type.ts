export interface ClaimMarketListing {
    type: "claim_market_listing",
    claimMarketListingData: {
        marketListingId: string
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

export interface ClaimCharacterQuest {
    type: "claim_character_quest",
    claimCharacterQuestData: {
        characterQuestId: number
    }
}