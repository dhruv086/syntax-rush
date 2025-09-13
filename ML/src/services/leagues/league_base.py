"""
League-specific scoring logic for each league.
"""

def standard_scorer(player, report, plag_score, did_win, rules):
    # Example: similar to old logic, but use rules for thresholds
    max_time = 600  # fallback if not in rules
    plag_threshold = rules.get('plag_threshold', 0.85)
    win_points = 30 if did_win else 0
    plag_points = 0 if plag_score >= plag_threshold else 30
    efficiency_points = 0
    if report["time_taken"] <= max_time:
        efficiency_points += 20
    else:
        efficiency_points += max(0, 20 - (report["time_taken"] - max_time) // 10)
    if report["complexity_match"]:
        efficiency_points += 20
    total = win_points + plag_points + efficiency_points
    return min(total, 100)

def bronze_scorer(player, report, plag_score, did_win, rules):
    # Example: slightly stricter plagiarism, different max_time
    max_time = 500
    plag_threshold = rules.get('plag_threshold', 0.75)
    win_points = 30 if did_win else 0
    plag_points = 0 if plag_score >= plag_threshold else 30
    efficiency_points = 0
    if report["time_taken"] <= max_time:
        efficiency_points += 20
    else:
        efficiency_points += max(0, 20 - (report["time_taken"] - max_time) // 10)
    if report["complexity_match"]:
        efficiency_points += 20
    total = win_points + plag_points + efficiency_points
    return min(total, 100)

# Add more league scorers as needed, for now fallback to standard
# Add more league scorers as needed, for now fallback to standard

def silver_scorer(player, report, plag_score, did_win, rules):
    max_time = 450
    plag_threshold = rules.get('plag_threshold', 0.70)
    win_points = 30 if did_win else 0
    plag_points = 0 if plag_score >= plag_threshold else 30
    efficiency_points = 0
    if report["time_taken"] <= max_time:
        efficiency_points += 20
    else:
        efficiency_points += max(0, 20 - (report["time_taken"] - max_time) // 10)
    if report["complexity_match"]:
        efficiency_points += 20
    total = win_points + plag_points + efficiency_points
    return min(total, 100)

def gold_scorer(player, report, plag_score, did_win, rules):
    max_time = 400
    plag_threshold = rules.get('plag_threshold', 0.65)
    win_points = 30 if did_win else 0
    plag_points = 0 if plag_score >= plag_threshold else 30
    efficiency_points = 0
    if report["time_taken"] <= max_time:
        efficiency_points += 20
    else:
        efficiency_points += max(0, 20 - (report["time_taken"] - max_time) // 10)
    if report["complexity_match"]:
        efficiency_points += 20
    total = win_points + plag_points + efficiency_points
    return min(total, 100)

def platinum_scorer(player, report, plag_score, did_win, rules):
    max_time = 350
    plag_threshold = rules.get('plag_threshold', 0.60)
    win_points = 30 if did_win else 0
    plag_points = 0 if plag_score >= plag_threshold else 30
    efficiency_points = 0
    if report["time_taken"] <= max_time:
        efficiency_points += 20
    else:
        efficiency_points += max(0, 20 - (report["time_taken"] - max_time) // 10)
    if report["complexity_match"]:
        efficiency_points += 20
    total = win_points + plag_points + efficiency_points
    return min(total, 100)

def diamond_scorer(player, report, plag_score, did_win, rules):
    max_time = 300
    plag_threshold = rules.get('plag_threshold', 0.50)
    win_points = 30 if did_win else 0
    plag_points = 0 if plag_score >= plag_threshold else 30
    efficiency_points = 0
    if report["time_taken"] <= max_time:
        efficiency_points += 20
    else:
        efficiency_points += max(0, 20 - (report["time_taken"] - max_time) // 10)
    if report["complexity_match"]:
        efficiency_points += 20
    total = win_points + plag_points + efficiency_points
    return min(total, 100)

def master_scorer(player, report, plag_score, did_win, rules):
    max_time = 250
    plag_threshold = rules.get('plag_threshold', 0.40)
    win_points = 30 if did_win else 0
    plag_points = 0 if plag_score >= plag_threshold else 30
    efficiency_points = 0
    if report["time_taken"] <= max_time:
        efficiency_points += 20
    else:
        efficiency_points += max(0, 20 - (report["time_taken"] - max_time) // 10)
    if report["complexity_match"]:
        efficiency_points += 20
    total = win_points + plag_points + efficiency_points
    return min(total, 100)

def get_league_scorer(league):
    if league == "bronze":
        return bronze_scorer
    if league == "silver":
        return silver_scorer
    if league == "gold":
        return gold_scorer
    if league == "platinum":
        return platinum_scorer
    if league == "diamond":
        return diamond_scorer
    if league == "master":
        return master_scorer
    return standard_scorer