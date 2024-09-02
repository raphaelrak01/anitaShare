export enum ELinkingStatus {
  LINKED = 'linked', // 1srt event, when a fliiinker is linked to a customer after a research
  CUSTOMER_LIKED = 'customer_liked', //the customer liked a fliiinker
  CUSTOMER_CONFIRMED = 'customer_confirmed', // The customer has confirmed the fliiink
  FLIIINKER_ACCEPTED = 'fliiinker_accepted', // The fliiinker has accepted the proposal
  FLIIINKER_REFUSED = 'fliiinker_refused', // The fliiinker refused the proposal
  FLIIINKER_RELAUNCHED = 'fliiinker_relaunched', // We relaunch the fliiinker to reconsider his refusal, because the customer liked it anyway.
  FLIIINKER_ABORTED = 'fliiinker_aborted', // The customer has liked the fliiinker, but the fliiinker still refuses the proposal.
  IS_PRE_FLIIINK = 'is_pre_fliiink', // When the customer has liked a fliiinker and the fliiinker accepts the proposal, it's a pre-fliiink.
  IS_FLIIINK = 'is_fliiink', // The customer has confirmed the fliiink
  CANCELLED = 'cancelled', // The linking has not been concluded after X time (is neither in fliiink nor refused)
}
