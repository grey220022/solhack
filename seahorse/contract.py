from seahorse.prelude import *

declare_id('YourProgramIDHere')

class GlobalState(Account):
    counter: i64

@instruction
def initialize(admin: Signer, state: Empty[GlobalState]):
    state.init(
        payer = admin,
        space = 8 + 8,
        seeds = ['global-state']
    )
    state.counter = 0

@instruction
def increment(state: GlobalState, user: Signer):
    state.counter += 1

@instruction
def get_data(state: GlobalState) -> i64:
    return state.counter
