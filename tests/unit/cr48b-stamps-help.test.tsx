// @vitest-environment jsdom
/** CR-48b: "How stamps work" on the chapter intro (before play): copy, placement, disclosure behaviour. */
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/preact";
import en from "../../content/i18n/en/ui.json";
import { ChapterIntro, STAMPS_HELP_KEYS } from "../../src/ui/ChapterIntro.tsx";

afterEach(cleanup);

const COPY = [
  "Bronze: finish the chapter.",
  "Silver: most of your choices work (Inspector rating 75% or more). You spot at least a third of the red flags, and each mark on a safe detail takes one off. You report no more than one genuine message.",
  "Gold: almost all your choices work (Inspector rating 90% or more). You spot at least two thirds of the red flags and report no genuine messages. You also save the extra check for messages that need it: checking always earns full points, but a harmless message that isn't like this chapter's scams doesn't need one.",
  "Gold still allows one slip (doing what a scam asks). After it, every step you pick to limit the damage must help, and your first step must stop the damage.",
  "Stamps are about habits, not perfection. Every finished chapter earns one, and you can replay any finished chapter whenever you like.",
];

function intro(rules = false) {
  return render(
    <ChapterIntro
      name="Paris"
      intro="Paris, the last working day."
      rules={
        rules
          ? {
              title: "Ruchelune house rules",
              items: ["Payments only from the shared inbox."],
            }
          : undefined
      }
      onStart={() => undefined}
      onBack={() => undefined}
    />,
  );
}

describe("CR-48b: How stamps work", () => {
  it("pins the copy: a heading and five bullets, the R24 rule line (psych round 1 wording), all from ui.json", () => {
    expect(en.stamps_help_title).toBe("How stamps work");
    expect(STAMPS_HELP_KEYS.map((k) => en[k as keyof typeof en])).toEqual(COPY);
    expect(STAMPS_HELP_KEYS.length).toBeLessThanOrEqual(5);
    // R24 rule line (DECISIONS R24, GDD §7.3; learning-psychologist round 1 wording).
    expect(en.stamps_help_slip).toBe(
      "Gold still allows one slip (doing what a scam asks). After it, every step you pick to limit the damage must help, and your first step must stop the damage.",
    );
  });

  it("never counts falls and uses no shame wording (PSYCHOLOGY §9)", () => {
    const all = [en.stamps_help_title, ...COPY].join(" ");
    expect(all).not.toMatch(/\{|fall|fail|mistake|wrong|bad|lose|lost/i);
  });

  it("sits on the chapter intro after Start and Back, collapsed by default (Start stays first)", () => {
    const { container } = intro(true);
    const section = container.querySelector<HTMLElement>("[data-stamps-help]");
    if (!section) throw new Error("no stamps help");
    expect(section.closest("[data-chapter-intro]")).toBeTruthy();
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual([
      "Start",
      "Back to the chapters",
      "How stamps work",
    ]);
    // After the pinned rules too.
    const rules = container.querySelector("[data-chapter-rules]");
    expect(
      rules &&
        rules.compareDocumentPosition(section) &
          Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const toggle = within(section).getByRole("button", {
      name: "How stamps work",
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.closest("h2")).toBeTruthy();
    expect(
      container.querySelector("#stamps-help-panel")?.hasAttribute("hidden"),
    ).toBe(true);
  });

  it("opens and closes as a disclosure: h2 > button, aria-controls the list of five bullets", () => {
    intro();
    expect(
      screen.getByRole("heading", { level: 2, name: "How stamps work" }),
    ).toBeTruthy();
    const toggle = screen.getByRole("button", { name: "How stamps work" });
    expect(toggle.getAttribute("aria-controls")).toBe("stamps-help-panel");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const list = document.getElementById("stamps-help-panel");
    if (!list) throw new Error("no panel");
    expect(list.hasAttribute("hidden")).toBe(false);
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(COPY);
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(list.hasAttribute("hidden")).toBe(true);
  });
});
