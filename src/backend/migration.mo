import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldPracticeMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
    attempts : ?Nat;
    makes : ?Nat;
    streaks : ?Nat;
  };

  type OldAcceptingGiftsMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
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

  type OldStraightShotMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
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

  type OldApaNineBallMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
    seasonType : Text;
    matchType : Text;
    playerStats : [{
      playerId : Principal;
      skillLevel : Nat;
      pointsNeeded : Nat;
      defensiveShots : Nat;
      innings : Nat;
      ppi : Float;
      matchBehaviorPhase : Text;
      racks : [{
        validBreak : Bool;
        breakMaiden : Bool;
        ballsOnBreak : Int;
        runOut : Bool;
        deadBalls : Nat;
        ballsOnBreakAwardedToOpponent : Nat;
        inningScore : Int;
        totalRackScore : Nat;
      }];
      totalScore : Int;
      winPercentage : Float;
      isPlayerOfMatch : Bool;
      pointsWonConverted : Nat;
      pointsEarnedRunningTotal : Nat;
    }];
    winner : Principal;
    umpire : ?Principal;
    teamStats : [{
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
    }];
  };

  type OldMatchLogRecord = {
    #practice : OldPracticeMatch;
    #acceptingGifts : OldAcceptingGiftsMatch;
    #straightShot : OldStraightShotMatch;
    #apaNineBall : OldApaNineBallMatch;
  };

  type OldActor = {
    matchHistory : Map.Map<Text, OldMatchLogRecord>;
  };

  type NewPracticeMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
    attempts : ?Nat;
    makes : ?Nat;
    streaks : ?Nat;
  };

  type NewAcceptingGiftsMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
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

  type NewStraightShotMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
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

  type NewApaNineBallMatch = {
    base : {
      matchId : Text;
      mode : {
        #acceptingGifts;
        #straightShot;
        #apaPractice;
      };
      dateTime : Int;
      players : [{
        id : Principal;
        name : Text;
        skillLevel : ?Nat;
      }];
      notes : ?Text;
      owner : Principal;
    };
    seasonType : Text;
    matchType : Text;
    playerStats : [{
      playerId : Principal;
      skillLevel : Nat;
      pointsNeeded : Nat;
      defensiveShots : Nat;
      innings : Nat;
      ppi : Float;
      matchBehaviorPhase : Text;
      racks : [{
        validBreak : Bool;
        breakMaiden : Bool;
        ballsOnBreak : Int;
        runOut : Bool;
        deadBalls : Nat;
        ballsOnBreakAwardedToOpponent : Nat;
        inningScore : Int;
        totalRackScore : Nat;
      }];
      totalScore : Int;
      winPercentage : Float;
      isPlayerOfMatch : Bool;
      pointsWonConverted : Nat;
      pointsEarnedRunningTotal : Nat;
    }];
    winner : Principal;
    umpire : ?Principal;
    teamStats : [{
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
    }];
  };

  type OfficialApaMatchLog = {
    matchId : Text;
    dateTime : Time.Time;
    owner : Principal;
    date : Text;
    opponentName : Text;
    myScore : Text;
    theirScore : Text;
    points : Text;
    innings : Text;
    defensiveShots : Text;
    notes : Text;
  };

  type NewMatchLogRecord = {
    #practice : NewPracticeMatch;
    #acceptingGifts : NewAcceptingGiftsMatch;
    #straightShot : NewStraightShotMatch;
    #apaNineBall : NewApaNineBallMatch;
    #officialApaMatchLog : OfficialApaMatchLog;
  };

  type NewActor = {
    matchHistory : Map.Map<Text, NewMatchLogRecord>;
  };

  public func run(old : OldActor) : NewActor {
    let newMatchHistory = old.matchHistory.map<Text, OldMatchLogRecord, NewMatchLogRecord>(
      func(_k, oldRecord) {
        switch (oldRecord) {
          case (#practice(m)) { #practice(m) };
          case (#acceptingGifts(m)) { #acceptingGifts(m) };
          case (#straightShot(m)) { #straightShot(m) };
          case (#apaNineBall(m)) { #apaNineBall(m) };
        };
      }
    );
    { matchHistory = newMatchHistory };
  };
};
