import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";


// Data migration, always define migration module and use with clause, see documentation for details.

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);


  var inviteOnlyMode : Bool = false;

  func hasAccess(caller : Principal) : Bool {
    if (not inviteOnlyMode) {
      return not caller.isAnonymous();
    };
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public query ({ caller }) func getInviteOnlyMode() : async Bool {
    inviteOnlyMode;
  };

  public shared ({ caller }) func setInviteOnlyMode(enabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change invite-only mode");
    };
    inviteOnlyMode := enabled;
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Admins don't need approval");
    };
    if (UserApproval.isApproved(approvalState, caller)) {
      Runtime.trap("User is already approved");
    };
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  public type UserProfile = {
    name : Text;
    apaSkillLevel : ?Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: User must be approved to access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: User must be approved to access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: User must be approved to save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Player = {
    id : Principal;
    name : Text;
    skillLevel : ?Nat;
  };

  type MatchMode = {
    #acceptingGifts;
    #straightShot;
    #apaPractice;
  };

  type BaseMatchEntry = {
    matchId : Text;
    mode : MatchMode;
    dateTime : Time.Time;
    players : [Player];
    notes : ?Text;
    owner : Principal;
  };

  type PracticeMatch = {
    base : BaseMatchEntry;
    attempts : ?Nat;
    makes : ?Nat;
    streaks : ?Nat;
  };

  type AcceptingGiftsMatch = {
    base : BaseMatchEntry;
    rulesReference : Text;
    completionStatus : Bool;
    score : Nat;
    startingObjectBallCount : Nat;
    endingObjectBallCount : Nat;
    totalAttempts : Nat;
    setsCompleted : Nat;
    finalSetScorePlayer : Nat;
    finalSetScoreGhost : Nat;
  };

  type StraightShotMatch = {
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

  type ApaNineBallMatch = {
    base : BaseMatchEntry;
    seasonType : Text;
    matchType : Text;
    playerStats : [ApaPlayerStats];
    winner : Principal;
    umpire : ?Principal;
    teamStats : [TeamStats];
  };

  type OfficialAPAMatchLog = {
    matchId : Text;
    dateTime : Time.Time;
    owner : Principal;
    playerOneSkillLevel : ?Nat;
    playerTwoSkillLevel : ?Nat;
    date : Text;
    opponentName : Text;
    myScore : Text;
    theirScore : Text;
    innings : Text;
    defensiveShots : Text;
    notes : Text;
    didWin : ?Bool;
  };

  type ApaPlayerStats = {
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

  type RackScore = {
    validBreak : Bool;
    breakMaiden : Bool;
    ballsOnBreak : Int;
    runOut : Bool;
    deadBalls : Nat;
    ballsOnBreakAwardedToOpponent : Nat;
    inningScore : Int;
    totalRackScore : Nat;
  };

  type TeamStats = {
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

  type MatchLogRecord = {
    #practice : PracticeMatch;
    #acceptingGifts : AcceptingGiftsMatch;
    #straightShot : StraightShotMatch;
    #apaNineBall : ApaNineBallMatch;
    #officialApaMatchLog : OfficialAPAMatchLog;
  };

  type BallState = {
    ballNumber : Int;
    inn : Int;
    pocketed : Text;
    by : Text;
    score : Int;
    pna : Int;
    runOut : Text;
    all : Text;
    isBreak : Bool;
    points : Int;
    eoi : Bool;
    difficulty : Text;
    rack : Int;
    defense : Bool;
    gameId : Text;
    activePlayer : Text;
    calledShot : Bool;
    finalBall : Int;
    id : Int;
    defensiveShot : Bool;
    positionPlay : Text;
    intendedPocket : Text;
  };

  type ApiMatch = {
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
    startingObjectBallCount : ?Nat;
    endingObjectBallCount : ?Nat;
    totalAttempts : ?Nat;
    setsCompleted : ?Nat;
    finalSetScorePlayer : ?Nat;
    finalSetScoreGhost : ?Nat;
    officialApaMatchLogData : ?OfficialAPAMatchLogData;
  };

  type OfficialAPAMatchLogData = {
    date : Text;
    opponentName : Text;
    myScore : Text;
    theirScore : Text;
    innings : Text;
    defensiveShots : Text;
    notes : Text;
    playerOneSkillLevel : ?Nat;
    playerTwoSkillLevel : ?Nat;
    didWin : ?Bool;
  };

  type APAMatchStatsUiContainer = {
    seasonType : Text;
    matchType : Text;
    summary : APAMatchStatsUiSummary;
    players : [?APA9MatchPlayerStatsUi];
  };

  type APAMatchStatsUiSummary = {
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

  type APAMatchStatsUiRackStats = {
    rackNumber : Nat;
    description : Text;
    timestamp : Time.Time;
    extraStats : Text;
    playerStats : [?APA9MatchPlayerStatsUi];
    summary : Text;
    matchId : Text;
    rackStats : [RackStat];
  };

  type RackStat = {
    rackNumber : Nat;
    description : Text;
    timestamp : Time.Time;
    extraStats : Text;
    summary : Text;
    matchId : Text;
    rackNumberCopy : Nat;
  };

  type APA9MatchPlayerStatsUi = {
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

  type APADetailedInnningSummary = {
    player : Text;
    points : Nat;
    deadBalls : Nat;
    defensiveShots : Nat;
  };

  type AGSession = {
    currentObjectBallCount : Nat;
  };

  type MatchOwnerPattern = {
    #practice : PracticeMatch;
    #acceptingGifts : AcceptingGiftsMatch;
    #straightShot : StraightShotMatch;
    #apaNineBall : ApaNineBallMatch;
  };

  let matchHistory = Map.empty<Text, MatchLogRecord>();
  let apaBallState = Map.empty<Int, BallState>();
  var apaStartingPlayer : ?Text = null;
  let agSessions = Map.empty<Principal, AGSession>();

  func getPointsToWin(skillLevel : Nat) : Nat {
    switch (skillLevel) {
      case (1) { 14 };
      case (2) { 19 };
      case (3) { 25 };
      case (4) { 31 };
      case (5) { 38 };
      case (6) { 46 };
      case (7) { 55 };
      case (_) { 1 };
    };
  };

  func computeDidWin(playerOneSkillLevel : ?Nat, playerTwoSkillLevel : ?Nat, myScore : Text, theirScore : Text) : ?Bool {
    switch (playerOneSkillLevel, playerTwoSkillLevel, Nat.fromText(myScore), Nat.fromText(theirScore)) {
      case (?p1Skill, ?p2Skill, ?myScoreNum, ?theirScoreNum) {
        let myTargetPoints = getPointsToWin(p1Skill);
        let theirTargetPoints = getPointsToWin(p2Skill);

        switch (myScoreNum >= myTargetPoints, theirScoreNum >= theirTargetPoints) {
          case (true, false) { ?true };
          case (false, true) { ?false };
          case (_) { null };
        };
      };
      case (_) { null };
    };
  };

  func convertToApiMatch(matchRecord : MatchLogRecord) : ApiMatch {
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
          startingObjectBallCount = null;
          endingObjectBallCount = null;
          totalAttempts = null;
          setsCompleted = null;
          finalSetScorePlayer = null;
          finalSetScoreGhost = null;
          officialApaMatchLogData = null;
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
          startingObjectBallCount = ?agMatch.startingObjectBallCount;
          endingObjectBallCount = ?agMatch.endingObjectBallCount;
          totalAttempts = ?agMatch.totalAttempts;
          setsCompleted = ?agMatch.setsCompleted;
          finalSetScorePlayer = ?agMatch.finalSetScorePlayer;
          finalSetScoreGhost = ?agMatch.finalSetScoreGhost;
          officialApaMatchLogData = null;
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
          startingObjectBallCount = null;
          endingObjectBallCount = null;
          totalAttempts = null;
          setsCompleted = null;
          finalSetScorePlayer = null;
          finalSetScoreGhost = null;
          officialApaMatchLogData = null;
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
              .map<ApaPlayerStats, ?APA9MatchPlayerStatsUi>(
                func(stats) {
                  ?convertToUiPlayerStats(stats, apaMatch.seasonType, apaMatch.matchType);
                }
              )
              .toArray();
          };
          startingObjectBallCount = null;
          endingObjectBallCount = null;
          totalAttempts = null;
          setsCompleted = null;
          finalSetScorePlayer = null;
          finalSetScoreGhost = null;
          officialApaMatchLogData = null;
        };
      };
      case (#officialApaMatchLog(log)) {
        {
          matchId = log.matchId;
          mode = #apaPractice;
          dateTime = log.dateTime;
          players = [];
          notes = ?log.notes;
          owner = log.owner;
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
          apaMatchInfo = null;
          startingObjectBallCount = null;
          endingObjectBallCount = null;
          totalAttempts = null;
          setsCompleted = null;
          finalSetScorePlayer = null;
          finalSetScoreGhost = null;
          officialApaMatchLogData = ?{
            date = log.date;
            opponentName = log.opponentName;
            myScore = log.myScore;
            theirScore = log.theirScore;
            innings = log.innings;
            defensiveShots = log.defensiveShots;
            notes = log.notes;
            playerOneSkillLevel = log.playerOneSkillLevel;
            playerTwoSkillLevel = log.playerTwoSkillLevel;
            didWin = log.didWin;
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

  func getMatchOwner(matchRecord : MatchLogRecord) : Principal {
    switch (matchRecord) {
      case (#practice(m)) { m.base.owner };
      case (#acceptingGifts(m)) { m.base.owner };
      case (#straightShot(m)) { m.base.owner };
      case (#apaNineBall(m)) { m.base.owner };
      case (#officialApaMatchLog(m)) { m.owner };
    };
  };

  func setMatchOwner(matchRecord : MatchLogRecord, newOwner : Principal) : MatchLogRecord {
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
      case (#officialApaMatchLog(m)) {
        #officialApaMatchLog({
          m with
          owner = newOwner;
        });
      };
    };
  };

  public shared ({ caller }) func saveMatch(matchId : Text, matchRecord : MatchLogRecord) : async () {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can save matches");
    };

    let processedMatchRecord = switch (matchRecord) {
      case (#officialApaMatchLog(log)) {
        #officialApaMatchLog({
          log with
          didWin = computeDidWin(log.playerOneSkillLevel, log.playerTwoSkillLevel, log.myScore, log.theirScore);
        });
      };
      case (_) { matchRecord };
    };

    let secureMatch = setMatchOwner(processedMatchRecord, caller);
    matchHistory.add(matchId, secureMatch);
  };

  public query ({ caller }) func getMatch(matchId : Text) : async ?ApiMatch {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view matches");
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
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can view matches");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    matchHistory.values()
      .filter(func(m : MatchLogRecord) : Bool {
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

  public shared ({ caller }) func updateMatch(matchId : Text, updatedMatch : MatchLogRecord) : async () {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can update matches");
    };

    switch (matchHistory.get(matchId)) {
      case (null) { Runtime.trap("Match with id " # matchId # " does not exist") };
      case (?existingMatch) {
        let existingOwner = getMatchOwner(existingMatch);
        if (caller != existingOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own matches");
        };

        let processedMatchRecord = switch (updatedMatch) {
          case (#officialApaMatchLog(log)) {
            #officialApaMatchLog({
              log with
              didWin = computeDidWin(log.playerOneSkillLevel, log.playerTwoSkillLevel, log.myScore, log.theirScore);
            });
          };
          case (_) { updatedMatch };
        };

        let secureMatch = setMatchOwner(processedMatchRecord, existingOwner);
        matchHistory.add(matchId, secureMatch);
      };
    };
  };

  public shared ({ caller }) func deleteMatch(matchId : Text) : async () {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can delete matches");
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

  public shared ({ caller }) func computeAPASummary(startingPlayer : Text, ballStates : [BallState]) : async APADetailedInnningSummary {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can compute APA summaries");
    };

    var playerAPoints = 0;
    var playerBPoints = 0;
    var playerADeadBalls = 0;
    var playerBDeadBalls = 0;
    var playerADefensiveShots = 0;
    var playerBDefensiveShots = 0;
    var inningCounter = 1;
    var currentPlayer = startingPlayer;
    var consecutiveDefensiveShots = 0;
    var defensivePointsAwarded = false;

    func switchPlayer(currentPlayer : Text) : Text {
      if (currentPlayer == "A") { "B" } else {
        "A";
      };
    };

    for (ball in ballStates.values()) {
      if (ball.activePlayer == currentPlayer) {
        if (ball.defensiveShot) {
          consecutiveDefensiveShots += 1;
          if (currentPlayer == "A") {
            playerADefensiveShots += 1;
          } else if (currentPlayer == "B") {
            playerBDefensiveShots += 1;
          };
        } else {
          consecutiveDefensiveShots := 0;
        };

        if (consecutiveDefensiveShots >= 3 and not defensivePointsAwarded) {
          if (currentPlayer == "A") {
            playerBPoints += 3;
          } else {
            playerAPoints += 3;
          };
          defensivePointsAwarded := true;
        } else if (consecutiveDefensiveShots < 3) {
          defensivePointsAwarded := false;
        };
      } else {
        currentPlayer := switchPlayer(currentPlayer);
        consecutiveDefensiveShots := 0;
      };

      if (ball.defense) {
        if (currentPlayer == "A") {
          playerADefensiveShots += 1;
        } else if (currentPlayer == "B") {
          playerBDefensiveShots += 1;
        };
      };
    };

    {
      player = "A";
      points = playerAPoints;
      deadBalls = playerADeadBalls;
      defensiveShots = playerADefensiveShots;
    };
  };

  func internalSetCurrentObjectBallCount(caller : Principal, newCount : Nat) : Nat {
    if (newCount < 2 or newCount > 7) {
      Runtime.trap("Invalid value. Only the range 2–7 is allowed");
    };
    let newState : AGSession = {
      currentObjectBallCount = newCount;
    };
    agSessions.add(caller, newState);
    newCount;
  };

  public shared ({ caller }) func setCurrentObjectBallCount(newCount : Nat) : async Nat {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can modify state");
    };
    internalSetCurrentObjectBallCount(caller, newCount);
  };

  public shared ({ caller }) func completeSession(finalCount : Nat) : async Nat {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can modify state");
    };
    internalSetCurrentObjectBallCount(caller, finalCount);
  };

  public query ({ caller }) func getCurrentObjectBallCount() : async Nat {
    if (not hasAccess(caller)) {
      Runtime.trap("Unauthorized: Only approved users can fetch state");
    };
    switch (agSessions.get(caller)) {
      case (null) { 2 };
      case (?session) { session.currentObjectBallCount };
    };
  };
};

