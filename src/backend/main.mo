import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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
    attempts : Nat;
    makes : Nat;
    completionTime : ?Nat;
  };

  public type MatchRecord = {
    #practice : PracticeMatch;
    #acceptingGifts : AcceptingGiftsMatch;
    #straightShot : StraightShotMatch;
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
          attempts = ?ssMatch.attempts;
          makes = ?ssMatch.makes;
          streaks = null;
          rulesReference = null;
          completionStatus = null;
          score = null;
          completionTime = ssMatch.completionTime;
        };
      };
    };
  };

  func getMatchOwner(matchRecord : MatchRecord) : Principal {
    switch (matchRecord) {
      case (#practice(m)) { m.base.owner };
      case (#acceptingGifts(m)) { m.base.owner };
      case (#straightShot(m)) { m.base.owner };
    };
  };

  public shared ({ caller }) func saveMatch(matchId : Text, matchRecord : MatchRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save matches");
    };

    let owner = getMatchOwner(matchRecord);
    if (caller != owner) {
      Runtime.trap("Unauthorized: Can only save your own matches");
    };

    matchHistory.add(matchId, matchRecord);
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
          true
        } else {
          let owner = getMatchOwner(m);
          caller == owner
        }
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
        let newOwner = getMatchOwner(updatedMatch);

        if (caller != existingOwner) {
          Runtime.trap("Unauthorized: Can only update your own matches");
        };

        if (existingOwner != newOwner) {
          Runtime.trap("Cannot change match owner");
        };

        matchHistory.add(matchId, updatedMatch);
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
