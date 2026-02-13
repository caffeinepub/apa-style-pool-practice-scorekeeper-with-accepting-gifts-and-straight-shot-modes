import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat32 "mo:core/Nat32";

module {
  type UserProfile = {
    name : Text;
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
    dateTime : Int;
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

  type OldMatchRecord = {
    #practice : PracticeMatch;
    #acceptingGifts : AcceptingGiftsMatch;
    #straightShot : StraightShotMatch;
  };

  type NewMatchRecord = {
    #practice : PracticeMatch;
    #acceptingGifts : AcceptingGiftsMatch;
    #straightShot : StraightShotMatch;
    #apaNineBall : {
      base : BaseMatchEntry;
      seasonType : Text;
      matchType : Text;
      playerStats : [NewApaPlayerStats];
      winner : Principal;
      umpire : ?Principal;
      teamStats : [TeamStats];
    };
  };

  type NewApaPlayerStats = {
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

  public type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    matchHistory : Map.Map<Text, OldMatchRecord>;
  };

  public type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    matchHistory : Map.Map<Text, NewMatchRecord>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      matchHistory = old.matchHistory.map<Text, OldMatchRecord, NewMatchRecord>(
        func(_id, oldRecord) { oldRecord },
      )
    };
  };
};
