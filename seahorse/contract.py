from seahorse.prelude import *

declare_id('CEvVPokPjs4kwWaAkBjQXm1Yt9R4acFyDV7NzPNidhcf')

# Define the global state for the contract
class GlobalState(Account):
    owner: Pubkey

# Define the mapping account for storing phone to address mapping
class PhoneToAddress(Account):
    phone_number: str
    sol_address: Pubkey

# Initialize the global state
@instruction
def initialize(owner: Signer, global_state: Empty[GlobalState]):
    global_state = global_state.init(payer=owner, seeds=["global_state"])
    global_state.owner = owner.key()

# Add a new mapping
@instruction
def add_mapping(owner: Signer, global_state: GlobalState, phone_to_address: Empty[PhoneToAddress],  phone_number: str, sol_address: Pubkey):
    assert owner.key() == global_state.owner, "Unauthorized"

    phone_to_address = phone_to_address.init(payer=owner, seeds=[phone_number])

    phone_to_address.phone_number = phone_number
    phone_to_address.sol_address = sol_address

# Get Solana address by phone number
@instruction
def get_address_by_phone(phone_to_address: PhoneToAddress, phone_number: str) -> Pubkey:
    assert phone_to_address.phone_number == phone_number, "Phone number mismatch"
    return phone_to_address.sol_address
