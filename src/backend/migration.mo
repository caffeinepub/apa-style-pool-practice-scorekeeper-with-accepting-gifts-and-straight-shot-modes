import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Previous UserProfile without apaSkillLevel
  type OldUserProfile = {
    name : Text;
  };

  // Old actor with Map of old user profiles
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  // New actor with new user profiles type
  type NewUserProfile = {
    name : Text;
    apaSkillLevel : ?Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldProfile) {
        { oldProfile with apaSkillLevel = null };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
