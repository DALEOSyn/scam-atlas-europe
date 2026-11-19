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
  "Silver: your choices work most of the time (Inspector rating 75% or more), you spot at least a third of the red flags (a mark on a safe detail takes one off), and you report at most one genuine message.",
  "Gold: your choices almost always work (90% or more), you spot at least two thirds of the red flags, you report no genuine messages, and you skip extra checks on harmless messages outside this chapter's scams.",
  "Gold allows one slip, as long as every step you picked after it helped, starting with one that stops the damage.",
  "Stamps are about habits, not perfection. Every finished chapter earns one, and you can replay any chapter whenever you like.",
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
  it("pins the copy: a heading and five bullets, the R24 rule line verbatim, all from ui.json", () => {
    expect(en.stamps_help_title).toBe("How stamps work");
    expect(STAMPS_HELP_KEYS.map((k) => en[k as keyof typeof en])).toEqual(COPY);
    expect(STAMPS_HELP_KEYS.length).toBeLessThanOrEqual(5);
    // R24 rule line (DECISIONS R24, GDD §7.3).
    expect(en.stamps_help_slip).toBe(
      "Gold allows one slip, as long as every step you picked after it helped, starting with one that stops the damage.",
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
