LEAGUE_RULES={
    "standard":{
        "min_xp":0.00,
        "max_xp":120.00,
        "cap":0,
        "plag_threshold":0.85
    },

    "bronze":{
        "min_xp":120.00,
        "max_xp":300.00,
        "cap":30,                   # 6-7 matches.
        "plag_threshold":0.75
    },

    "silver":{
        "min_xp":300.00,
        "max_xp":600.00,
        "cap":40,                   # 8-12 matches.
        "plag_threshold":0.70
    },

    "gold":{
        "min_xp":600.00,
        "max_xp":"1000.00",
        "cap":50,
        "plag_threshold":0.65       # 12-15 matches 
    },

    "platinum":{
        "min_xp":1000.00,
        "max_xp":1500.00,
        "cap":60,
        "plag_threshold":0.60       # 15-17 matches
    },

    "diamond":{
        "min_xp": 1500.00,
        "max_xp": 2100.00,
        "cap": 70,                  # ~20+ matches
        "plag_threshold": 0.50
    },
    
    "master": {
        "min_xp": 2100.00,
        "max_xp": float("inf"),
        "cap": None,                # No cap, free rating/MMR
        "plag_threshold": 0.40      # Strictest
    },
}

