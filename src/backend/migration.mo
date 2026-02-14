import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type Player = {
    id : Principal.Principal;
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
    dateTime : Int;
    players : [Player];
    notes : ?Text;
    owner : Principal.Principal;
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

  type ApaPlayerStats = {
    playerId : Principal.Principal;
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

  type ApaNineBallMatch = {
    base : BaseMatchEntry;
    seasonType : Text;
    matchType : Text;
    playerStats : [ApaPlayerStats];
    winner : Principal.Principal;
    umpire : ?Principal.Principal;
    teamStats : [TeamStats];
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

  type MatchRecord = {
    #practice : PracticeMatch;
    #acceptingGifts : AcceptingGiftsMatch;
    #straightShot : StraightShotMatch;
    #apaNineBall : ApaNineBallMatch;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    matchHistory : Map.Map<Text, MatchRecord>;
  };

  type AGSession = {
    currentObjectBallCount : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    matchHistory : Map.Map<Text, MatchRecord>;
    agSessions : Map.Map<Principal.Principal, AGSession>;
  };

  public func run(old : OldActor) : NewActor {
    { old with agSessions = Map.empty<Principal.Principal, AGSession>() };
  };
};
