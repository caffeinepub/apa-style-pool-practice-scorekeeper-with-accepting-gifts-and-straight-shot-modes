import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import Nat "mo:core/Nat";
import List "mo:core/List";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type Player = {
    id : Principal;
    name : Text;
    skillLevel : ?Nat;
  };

  public type MatchMode = {
    #acceptingGifts;
    #straightShot;
    #apaPractice;
  };

  public type BaseMatchEntry = {
    matchId : Text;
    mode : MatchMode;
    dateTime : Time.Time;
    players : [Player];
    notes : ?Text;
    owner : Principal;
  };

  public type PracticeMatch = {
    base : BaseMatchEntry;
    attempts : ?Nat;
    makes : ?Nat;
    streaks : ?Nat;
  };

  public type AcceptingGiftsMatch = {
    base : BaseMatchEntry;
    rulesReference : Text;
    completionStatus : Bool;
    score : Nat;
  };

  public type StraightShotMatch = {
    base : BaseMatchEntry;
    strokes : [Nat];
    scratchStrokes : [Nat];
    time : ?Nat;
    shots : Nat;
    ballsMade : Nat;
    score : {
      firstShot : Nat;
      secondShot : Nat;
      thirdShot : Nat;
      fourthShot : Nat;
      total : Nat;
    };
  };

  public type ApaNineBallMatch = {
    base : BaseMatchEntry;
    seasonType : Text;
    matchType : Text;
    playerStats : [ApaPlayerStats];
    winner : Principal;
    umpire : ?Principal;
    teamStats : [TeamStats];
  };

  public type ApaPlayerStats = {
    playerId : Principal;
    skillLevel : Nat;
    pointsNeeded : Nat;
    defensiveShots : Nat;
    innings : Nat;
    ppi : Float;
    matchBehaviorPhase : Text;
    racks : [RackScore];
    totalScore : Int;
    winPercentage : Float;
    isPlayerOfMatch : Bool;
    pointsWonConverted : Nat;
    pointsEarnedRunningTotal : Nat;
  };

  public type RackScore = {
    validBreak : Bool;
    breakMaiden : Bool;
    ballsOnBreak : Int;
    runOut : Bool;
    deadBalls : Nat;
    ballsOnBreakAwardedToOpponent : Nat;
    inningScore : Int;
    totalRackScore : Nat;
  };

  public type TeamStats = {
    matchesPlayed : Nat;
    matchesWon : Nat;
    playtimes : [Float];
    teamName : Text;
    teamId : Text;
    teamWinState : {
      #teammatchInProgress;
      #win : Text;
      #loss : Text;
      #forfeit : Text;
    };
    teamPenaltyState : {
      #pending;
      #none;
      #penalty : Text;
      #penaltyAwarded : Text;
    };
    teamAverageScore : Float;
    score : {
      totalPoints : Int;
    };
  };

  public type MatchRecord = {
    #practice : PracticeMatch;
    #acceptingGifts : AcceptingGiftsMatch;
    #straightShot : StraightShotMatch;
    #apaNineBall : ApaNineBallMatch;
  };

  let matchHistory = Map.empty<Text, MatchRecord>();

  public type ApiMatch = {
    matchId : Text;
    mode : MatchMode;
    dateTime : Time.Time;
    players : [Player];
    notes : ?Text;
    owner : Principal;
    attempts : ?Nat;
    makes : ?Nat;
    streaks : ?Nat;
    rulesReference : ?Text;
    completionStatus : ?Bool;
    score : ?Nat;
    completionTime : ?Nat;
    strokes : ?[Nat];
    scratchStrokes : ?[Nat];
    firstShotScore : ?Nat;
    secondShotScore : ?Nat;
    thirdShotScore : ?Nat;
    fourthShotScore : ?Nat;
    totalScore : ?Nat;
    shots : ?Nat;
    ballsMade : ?Nat;
    apaMatchInfo : ?APAMatchStatsUiContainer;
  };

  public type APAMatchStatsUiContainer = {
    seasonType : Text;
    matchType : Text;
    summary : APAMatchStatsUiSummary;
    players : [?APA9MatchPlayerStatsUi];
  };

  public type APAMatchStatsUiSummary = {
    timestamp : Time.Time;
    level : {
      #all;
      #playerMatch;
      #teamMatch;
      #detailRack;
    };
    extraStats : Text;
    playerStats : [?APA9MatchPlayerStatsUi];
    location : Text;
    umpire : ?Principal;
    phase : Text;
    comments : Text;
    isInProgress : Bool;
    seasonType : Text;
    matchType : Text;
    id : Text;
    summary : Text;
    points : Nat;
    pointsAwarded : Nat;
    rackStats : APAMatchStatsUiRackStats;
  };

  public type APAMatchStatsUiRackStats = {
    rackNumber : Nat;
    description : Text;
    timestamp : Time.Time;
    extraStats : Text;
    playerStats : [?APA9MatchPlayerStatsUi];
    summary : Text;
    matchId : Text;
    rackStats : [RackStat];
  };

  public type RackStat = {
    rackNumber : Nat;
    description : Text;
    timestamp : Time.Time;
    extraStats : Text;
    summary : Text;
    matchId : Text;
    rackNumberCopy : Nat;
  };

  public type APA9MatchPlayerStatsUi = {
    timestamp : Time.Time;
    points : Nat;
    pointsAwarded : Nat;
    isPlayerOfMatch : Bool;
    id : Text;
    umpire : Text;
    location : Text;
    comments : Text;
    rackStats : APAMatchStatsUiRackStats;
    level : {
      #all;
      #playerMatch;
      #teamMatch;
      #detailRack;
    };
    matchType : Text;
    seasonType : Text;
    summary : Text;
    racksPlayed : Nat;
    rank : Text;
    rankIcon : Text;
    breakMaidenCount : Nat;
    validBreakCount : Nat;
    deadBallsPerRack : [Nat];
    defensiveShots : Nat;
    pointsNeeded : Nat;
    skillLevel : Nat;
    matchBehaviorPhase : Text;
    innings : Nat;
    ppi : Float;
    totalScore : Int;
    winPercentage : Float;
    totalBallsScoredPerRack : [Nat];
    rackCount : Nat;
    runOutCount : Nat;
    ballsOnBreakAwardedToOpponentCount : Nat;
    runOutAttempts : Nat;
    breakRuns : [Nat];
    inningScores : [Int];
    ballsOnBreak : [Int];
    pointsWonConverted : Nat;
    pointsEarnedRunningTotal : Nat;
  };

  func convertToApiMatch(matchRecord : MatchRecord) : ApiMatch {
    switch (matchRecord) {
      case (#practice(practiceMatch)) {
        {
          matchId = practiceMatch.base.matchId;
          mode = practiceMatch.base.mode;
          dateTime = practiceMatch.base.dateTime;
          players = practiceMatch.base.players;
          notes = practiceMatch.base.notes;
          owner = practiceMatch.base.owner;
          attempts = practiceMatch.attempts;
          makes = practiceMatch.makes;
          streaks = practiceMatch.streaks;
          rulesReference = null;
          completionStatus = null;
          score = null;
          completionTime = null;
          strokes = null;
          scratchStrokes = null;
          firstShotScore = null;
          secondShotScore = null;
          thirdShotScore = null;
          fourthShotScore = null;
          totalScore = null;
          shots = null;
          ballsMade = null;
          apaMatchInfo = null;
        };
      };
      case (#acceptingGifts(agMatch)) {
        {
          matchId = agMatch.base.matchId;
          mode = agMatch.base.mode;
          dateTime = agMatch.base.dateTime;
          players = agMatch.base.players;
          notes = agMatch.base.notes;
          owner = agMatch.base.owner;
          attempts = null;
          makes = null;
          streaks = null;
          rulesReference = ?agMatch.rulesReference;
          completionStatus = ?agMatch.completionStatus;
          score = ?agMatch.score;
          completionTime = null;
          strokes = null;
          scratchStrokes = null;
          firstShotScore = null;
          secondShotScore = null;
          thirdShotScore = null;
          fourthShotScore = null;
          totalScore = null;
          shots = null;
          ballsMade = null;
          apaMatchInfo = null;
        };
      };
      case (#straightShot(ssMatch)) {
        {
          matchId = ssMatch.base.matchId;
          mode = ssMatch.base.mode;
          dateTime = ssMatch.base.dateTime;
          players = ssMatch.base.players;
          notes = ssMatch.base.notes;
          owner = ssMatch.base.owner;
          attempts = null;
          makes = null;
          streaks = null;
          rulesReference = null;
          completionStatus = null;
          score = null;
          completionTime = ssMatch.time;
          strokes = ?ssMatch.strokes;
          scratchStrokes = ?ssMatch.scratchStrokes;
          firstShotScore = ?ssMatch.score.firstShot;
          secondShotScore = ?ssMatch.score.secondShot;
          thirdShotScore = ?ssMatch.score.thirdShot;
          fourthShotScore = ?ssMatch.score.fourthShot;
          totalScore = ?ssMatch.score.total;
          shots = ?ssMatch.shots;
          ballsMade = ?ssMatch.ballsMade;
          apaMatchInfo = null;
        };
      };
      case (#apaNineBall(apaMatch)) {
        {
          matchId = apaMatch.base.matchId;
          mode = apaMatch.base.mode;
          dateTime = apaMatch.base.dateTime;
          players = apaMatch.base.players;
          notes = apaMatch.base.notes;
          owner = apaMatch.base.owner;
          attempts = null;
          makes = null;
          streaks = null;
          rulesReference = null;
          completionStatus = null;
          score = null;
          completionTime = null;
          strokes = null;
          scratchStrokes = null;
          firstShotScore = null;
          secondShotScore = null;
          thirdShotScore = null;
          fourthShotScore = null;
          totalScore = null;
          shots = null;
          ballsMade = null;
          apaMatchInfo = ?{
            seasonType = apaMatch.seasonType;
            matchType = apaMatch.matchType;
            summary = convertToUiSummary(apaMatch.playerStats[0], apaMatch.seasonType, apaMatch.matchType);
            players = List.fromArray<ApaPlayerStats>(apaMatch.playerStats)
              .map<ApaPlayerStats, ?APA9MatchPlayerStatsUi>(func(stats) { ?convertToUiPlayerStats(stats, apaMatch.seasonType, apaMatch.matchType) })
              .toArray();
          };
        };
      };
    };
  };

  func convertToUiSummary(playerStats : ApaPlayerStats, seasonType : Text, matchType : Text) : APAMatchStatsUiSummary {
    {
      timestamp = 0;
      level = #all;
      extraStats = "";
      playerStats = [?convertToUiPlayerStats(playerStats, seasonType, matchType)];
      location = "";
      umpire = null;
      phase = "";
      comments = "";
      isInProgress = false;
      seasonType;
      matchType;
      id = "";
      summary = "";
      points = 0;
      pointsAwarded = 0;
      rackStats = {
        rackNumber = 0;
        description = "";
        timestamp = 0;
        extraStats = "";
        playerStats = [?convertToUiPlayerStats(playerStats, seasonType, matchType)];
        summary = "";
        matchId = "";
        rackStats = [{
          rackNumber = 0;
          description = "";
          timestamp = 0;
          extraStats = "";
          summary = "";
          matchId = "";
          rackNumberCopy = 0;
        }];
      };
    };
  };

  func convertToUiPlayerStats(playerStats : ApaPlayerStats, seasonType : Text, matchType : Text) : APA9MatchPlayerStatsUi {
    {
      timestamp = 0;
      points = 0;
      pointsAwarded = 0;
      isPlayerOfMatch = playerStats.isPlayerOfMatch;
      id = playerStats.playerId.toText();
      umpire = "";
      location = "";
      comments = "";
      rackStats = {
        rackNumber = 0;
        description = "";
        timestamp = 0;
        extraStats = "";
        playerStats = [];
        summary = "";
        matchId = "";
        rackStats = [];
      };
      level = #all;
      matchType;
      seasonType;
      summary = "";
      racksPlayed = 0;
      rank = "";
      rankIcon = "";
      breakMaidenCount = 0;
      validBreakCount = 0;
      deadBallsPerRack = [0];
      defensiveShots = playerStats.defensiveShots;
      pointsNeeded = playerStats.pointsNeeded;
      skillLevel = playerStats.skillLevel;
      matchBehaviorPhase = playerStats.matchBehaviorPhase;
      innings = playerStats.innings;
      ppi = playerStats.ppi;
      totalScore = playerStats.totalScore;
      winPercentage = playerStats.winPercentage;
      totalBallsScoredPerRack = [0];
      rackCount = 0;
      runOutCount = 0;
      ballsOnBreakAwardedToOpponentCount = 0;
      runOutAttempts = 0;
      breakRuns = [0];
      inningScores = [0];
      ballsOnBreak = [0];
      pointsWonConverted = playerStats.pointsWonConverted;
      pointsEarnedRunningTotal = playerStats.pointsEarnedRunningTotal;
    };
  };

  func getMatchOwner(matchRecord : MatchRecord) : Principal {
    switch (matchRecord) {
      case (#practice(m)) { m.base.owner };
      case (#acceptingGifts(m)) { m.base.owner };
      case (#straightShot(m)) { m.base.owner };
      case (#apaNineBall(m)) { m.base.owner };
    };
  };

  func setMatchOwner(matchRecord : MatchRecord, newOwner : Principal) : MatchRecord {
    switch (matchRecord) {
      case (#practice(m)) {
        #practice({
          m with
          base = {
            m.base with
            owner = newOwner;
          };
        });
      };
      case (#acceptingGifts(m)) {
        #acceptingGifts({
          m with
          base = {
            m.base with
            owner = newOwner;
          };
        });
      };
      case (#straightShot(m)) {
        #straightShot({
          m with
          base = {
            m.base with
            owner = newOwner;
          };
        });
      };
      case (#apaNineBall(m)) {
        #apaNineBall({
          m with
          base = {
            m.base with
            owner = newOwner;
          };
        });
      };
    };
  };

  public shared ({ caller }) func saveMatch(matchId : Text, matchRecord : MatchRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save matches");
    };

    // Always set the owner to the caller to prevent ownership spoofing
    let secureMatch = setMatchOwner(matchRecord, caller);
    matchHistory.add(matchId, secureMatch);
  };

  public query ({ caller }) func getMatch(matchId : Text) : async ?ApiMatch {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };

    switch (matchHistory.get(matchId)) {
      case (?matchRecord) {
        let owner = getMatchOwner(matchRecord);
        if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own matches");
        };
        ?convertToApiMatch(matchRecord);
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllMatches() : async [ApiMatch] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    matchHistory.values()
      .filter(func(m : MatchRecord) : Bool {
        if (isAdmin) {
          true;
        } else {
          let owner = getMatchOwner(m);
          caller == owner;
        };
      })
      .map(func(m) { convertToApiMatch(m) })
      .toArray();
  };

  public shared ({ caller }) func updateMatch(matchId : Text, updatedMatch : MatchRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update matches");
    };

    switch (matchHistory.get(matchId)) {
      case (null) { Runtime.trap("Match with id " # matchId # " does not exist") };
      case (?existingMatch) {
        let existingOwner = getMatchOwner(existingMatch);
        if (caller != existingOwner) {
          Runtime.trap("Unauthorized: Can only update your own matches");
        };
        // Preserve the original owner to prevent ownership changes
        let secureMatch = setMatchOwner(updatedMatch, existingOwner);
        matchHistory.add(matchId, secureMatch);
      };
    };
  };

  public shared ({ caller }) func deleteMatch(matchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete matches");
    };

    switch (matchHistory.get(matchId)) {
      case (null) { Runtime.trap("Match with id " # matchId # " does not exist") };
      case (?matchRecord) {
        let owner = getMatchOwner(matchRecord);
        if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own matches");
        };
        matchHistory.remove(matchId);
      };
    };
  };

  public shared ({ caller }) func clearHistory() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can clear all history");
    };
    matchHistory.clear();
  };
};
