export enum ELinkingEventName {
  LINK = 'link', // 1srt event, when a fliiinker is linked to a customer after a research
  CUSTOMER_LIKE = 'customer_like', //the customer liked a fliiinker
  FLIIINKER_ACCEPT = 'fliiinker_accept', // The fliiinker has accepted the proposal
  FLIIINKER_REFUSE = 'fliiinker_refuse', // The fliiinker refused the proposal
  FLIIINKER_RELAUNCH = 'fliiinker_relaunch', // We relaunch the fliiinker to reconsider his refusal, because the customer liked it anyway.
  FLIIINKER_ABORT = 'fliiinker_abort', // The customer has liked the fliiinker, but the fliiinker still refuses the proposal.
  IS_PRE_FLIIINK = 'is_pre_fliiink', // When the customer has liked a fliiinker and the fliiinker accepts the proposal, it's a pre-fliiink.
  CUSTOMER_CONFIRM = 'customer_confirm', // The customer has confirmed the fliiink
  IS_FLIIINK = 'is_fliiink', // The customer has confirmed the fliiink
}
