module {
  type OldActor = { /* old state */ };
  type NewActor = { /* new state */ };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
