import { describe, expect, it } from "vitest";

import {
  canTransitionTicketStatus,
} from "../../../src/Modules/Tickets/domain/ticket.transitions.js";

// from "../../../src/Modules/Tickets/domain/ticket-transitions.js";

import type {
  TicketStatus,
} from "../../../src/Modules/Tickets/domain/ticket-status.js";


describe("ticket status transitions", () => {

  const allowedTransitions: Array<
    [TicketStatus, TicketStatus]
  > = [
    ["OPEN", "IN_PROGRESS"],
    ["IN_PROGRESS", "RESOLVED"],
    ["RESOLVED", "IN_PROGRESS"],
    ["RESOLVED", "CLOSED"],
  ];


  it.each(allowedTransitions)(
    "allows %s -> %s",
    (current, requested) => {

      expect(
        canTransitionTicketStatus(
          current,
          requested,
        ),
      ).toBe(true);

    },
  );


  const prohibitedTransitions: Array<
    [TicketStatus, TicketStatus]
  > = [
    ["OPEN", "OPEN"],
    ["OPEN", "RESOLVED"],
    ["OPEN", "CLOSED"],

    ["IN_PROGRESS", "OPEN"],
    ["IN_PROGRESS", "IN_PROGRESS"],
    ["IN_PROGRESS", "CLOSED"],

    ["RESOLVED", "OPEN"],
    ["RESOLVED", "RESOLVED"],

    ["CLOSED", "OPEN"],
    ["CLOSED", "IN_PROGRESS"],
    ["CLOSED", "RESOLVED"],
    ["CLOSED", "CLOSED"],
  ];


  it.each(prohibitedTransitions)(
    "rejects %s -> %s",
    (current, requested) => {

      expect(
        canTransitionTicketStatus(
          current,
          requested,
        ),
      ).toBe(false);

    },
  );

});