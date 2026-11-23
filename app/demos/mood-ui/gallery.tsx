// The component gallery laid out on the canvas: stock shadcn/ui examples (cards, forms, lists, charts) composed
// from the vendored primitives in ./ui. Nothing here has its own colours: everything reads the theme variables.
import { type CSSProperties, type ReactNode, useState } from "react";
import { Avatar, Separator } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input, Textarea } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Progress, Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const Icon = ({ d, className }: { d: string; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

function CreateAccount() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your email below to create your account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline">
            <Icon d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.8s-1.2-.3-3.9 1.5a13.4 13.4 0 0 0-7 0C6.3 1.6 5.1 2 5.1 2A5 5 0 0 0 5 5.7a5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 7a3.4 3.4 0 0 0-.9 2.6V22" />
            Code host
          </Button>
          <Button variant="outline">
            <Icon d="M21 12a9 9 0 1 1-3-6.7L15.5 7.8A5.5 5.5 0 1 0 17.4 13H12v-3h9z" />
            Mail
          </Button>
        </div>
        <div className="relative flex items-center gap-3 text-xs text-(--muted-foreground) uppercase">
          <Separator className="flex-1" />
          or continue with
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="g-email">Email</Label>
          <Input id="g-email" type="email" placeholder="m@example.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="g-password">Password</Label>
          <Input id="g-password" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create account</Button>
      </CardFooter>
    </Card>
  );
}

function PaymentMethod() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment method</CardTitle>
        <CardDescription>Add a new payment method to your account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-3">
          {[
            ["card", "Card", "M2 7h20v12H2zM2 11h20"],
            ["bank", "Bank", "M3 21h18M5 21V10m14 11V10M12 3l9 5H3z"],
            ["wallet", "Wallet", "M3 7h17v13H3zM16 13h.01M3 7l13-4v4"],
          ].map(([value, label, d]) => (
            <Label
              key={value}
              htmlFor={`g-pay-${value}`}
              className="flex flex-col items-center justify-between gap-3 rounded-[calc(var(--radius)-2px)] border-2 border-(--muted) bg-transparent p-4 hover:bg-(--accent) hover:text-(--accent-foreground) has-data-[state=checked]:border-(--primary)"
            >
              <RadioGroupItem value={value as string} id={`g-pay-${value}`} className="sr-only" />
              <Icon d={d as string} className="size-6" />
              {label}
            </Label>
          ))}
        </RadioGroup>
        <div className="grid gap-2">
          <Label htmlFor="g-name">Name</Label>
          <Input id="g-name" placeholder="First Last" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="g-number">Card number</Label>
          <Input id="g-number" placeholder="0000 0000 0000 0000" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Month", "Year", "CVC"].map((l) => (
            <div key={l} className="grid gap-2">
              <Label htmlFor={`g-${l}`}>{l}</Label>
              <Input id={`g-${l}`} placeholder={l === "CVC" ? "123" : l === "Year" ? "2027" : "08"} />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continue</Button>
      </CardFooter>
    </Card>
  );
}

const REVENUE = [38, 52, 44, 61, 58, 72, 66, 80, 74, 91, 86, 98];

function Revenue() {
  const max = Math.max(...REVENUE);
  const points = REVENUE.map((v, i) => `${(i / (REVENUE.length - 1)) * 100},${40 - (v / max) * 36}`).join(" ");
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardDescription>Total revenue</CardDescription>
        <CardTitle className="text-3xl tabular-nums">$15,231.89</CardTitle>
        <CardAction>
          <Badge variant="outline">+20.1%</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="h-20 w-full" aria-hidden="true">
          <polyline
            points={`0,42 ${points} 100,42`}
            className="fill-(--primary)/10 stroke-none"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={points}
            className="fill-none stroke-(--primary)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </CardContent>
    </Card>
  );
}

function Subscriptions() {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardDescription>Subscriptions</CardDescription>
        <CardTitle className="text-3xl tabular-nums">+2,350</CardTitle>
        <CardAction>
          <Badge variant="secondary">+180.1%</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex h-20 items-end gap-1.5" aria-hidden="true">
          {REVENUE.map((v, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: static chart
              key={i}
              className="flex-1 rounded-t-[calc(var(--radius)-6px)] bg-(--primary)"
              style={{ height: `${(v / 98) * 100}%`, opacity: 0.35 + (i / REVENUE.length) * 0.65 }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const TEAM = [
  ["Sofia Davis", "sofia@example.com", "SD", "Owner"],
  ["Jackson Lee", "jackson@example.com", "JL", "Developer"],
  ["Isabella Nguyen", "bella@example.com", "IN", "Billing"],
];

function TeamMembers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>Invite your team members to collaborate.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {TEAM.map(([name, email, initials, role]) => (
          <div key={name} className="flex items-center gap-3">
            <Avatar initials={initials as string} />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-none font-medium">{name}</p>
              <p className="mt-1 truncate text-sm text-(--muted-foreground)">{email}</p>
            </div>
            <Button variant="outline" size="sm">
              {role}
              <Icon d="m6 9 6 6 6-6" className="text-(--muted-foreground)" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CookieSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cookie settings</CardTitle>
        <CardDescription>Manage your cookie settings here.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {[
          ["Strictly necessary", "Essential for the site to work.", true],
          ["Functional", "Remember your preferences.", false],
          ["Performance", "Help us improve the site.", false],
        ].map(([title, desc, on]) => (
          <div key={title as string} className="flex items-center justify-between gap-4">
            <Label htmlFor={`g-cookie-${title}`} className="flex flex-col items-start gap-1">
              <span>{title}</span>
              <span className="text-sm leading-snug font-normal text-(--muted-foreground)">{desc}</span>
            </Label>
            <Switch id={`g-cookie-${title}`} defaultChecked={on as boolean} />
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Save preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

function AccountTabs() {
  return (
    <Tabs defaultValue="account">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      {(["account", "password"] as const).map((tab) => (
        <TabsContent key={tab} value={tab}>
          <Card>
            <CardHeader>
              <CardTitle>{tab === "account" ? "Account" : "Password"}</CardTitle>
              <CardDescription>
                {tab === "account"
                  ? "Make changes to your account here. Click save when you're done."
                  : "Change your password here. After saving, you'll be logged out."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`g-${tab}-1`}>{tab === "account" ? "Name" : "Current password"}</Label>
                <Input
                  id={`g-${tab}-1`}
                  type={tab === "password" ? "password" : "text"}
                  defaultValue={tab === "account" ? "Pedro Duarte" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`g-${tab}-2`}>{tab === "account" ? "Username" : "New password"}</Label>
                <Input
                  id={`g-${tab}-2`}
                  type={tab === "password" ? "password" : "text"}
                  defaultValue={tab === "account" ? "@peduarte" : ""}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>{tab === "account" ? "Save changes" : "Save password"}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

const MESSAGES: [boolean, string][] = [
  [false, "Hi, how can I help you today?"],
  [true, "Hey, I'm having trouble with my account."],
  [false, "What seems to be the problem?"],
  [true, "I can't log in."],
];

function Chat() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar initials="SD" className="size-9" />
          <div>
            <CardTitle className="text-sm">Sofia Davis</CardTitle>
            <CardDescription>m@example.com</CardDescription>
          </div>
        </div>
        <CardAction>
          <Button variant="outline" size="sm" className="size-8 rounded-full p-0" aria-label="New message">
            <Icon d="M12 5v14M5 12h14" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {MESSAGES.map(([mine, text]) => (
          <p
            key={text}
            className={
              mine
                ? "ml-auto w-max max-w-[75%] rounded-[calc(var(--radius)+2px)] bg-(--primary) px-3 py-2 text-sm text-(--primary-foreground)"
                : "w-max max-w-[75%] rounded-[calc(var(--radius)+2px)] bg-(--muted) px-3 py-2 text-sm"
            }
          >
            {text}
          </p>
        ))}
      </CardContent>
      <CardFooter className="gap-2">
        <Input placeholder="Type your message…" aria-label="Message" />
        <Button className="size-9 shrink-0 p-0" aria-label="Send">
          <Icon d="M5 12h14M13 6l6 6-6 6" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function MoveGoal() {
  const [goal, setGoal] = useState(350);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Move goal</CardTitle>
        <CardDescription>Set your daily activity goal.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="size-8 rounded-full p-0"
            aria-label="Decrease"
            onClick={() => setGoal((g) => Math.max(200, g - 10))}
          >
            <Icon d="M5 12h14" />
          </Button>
          <div className="text-center">
            <div className="text-5xl font-bold tracking-tighter tabular-nums">{goal}</div>
            <div className="text-xs text-(--muted-foreground) uppercase">Calories / day</div>
          </div>
          <Button
            variant="outline"
            className="size-8 rounded-full p-0"
            aria-label="Increase"
            onClick={() => setGoal((g) => Math.min(500, g + 10))}
          >
            <Icon d="M12 5v14M5 12h14" />
          </Button>
        </div>
        <Slider
          value={[goal]}
          min={200}
          max={500}
          step={10}
          onValueChange={([v]) => setGoal(v ?? goal)}
          aria-label="Goal"
        />
        <div className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span>Today</span>
            <span className="text-(--muted-foreground) tabular-nums">{Math.round((260 / goal) * 100)}%</span>
          </div>
          <Progress value={Math.min(100, (260 / goal) * 100)} aria-label="Today's progress" />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full">
          Set goal
        </Button>
      </CardFooter>
    </Card>
  );
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Calendar() {
  const [picked, setPicked] = useState(new Set([12, 13, 14, 15]));
  // November 2026 starts on a Sunday and has 30 days.
  return (
    <Card className="gap-4 py-4">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="ghost" className="size-7 p-0" aria-label="Previous month">
            <Icon d="m15 18-6-6 6-6" />
          </Button>
          <span className="text-sm font-medium">November 2026</span>
          <Button variant="ghost" className="size-7 p-0" aria-label="Next month">
            <Icon d="m9 18 6-6-6-6" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {DAYS.map((d) => (
            <span key={d} className="pb-1 text-[0.8rem] text-(--muted-foreground)">
              {d}
            </span>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i + 1;
            const on = picked.has(day);
            if (day > 30)
              return (
                <span key={day} className="grid size-8 place-items-center text-sm text-(--muted-foreground)/50">
                  {day - 30}
                </span>
              );
            return (
              <Button
                key={day}
                variant={on ? "default" : "ghost"}
                className="size-8 justify-self-center p-0 font-normal"
                aria-pressed={on}
                onClick={() =>
                  setPicked((s) => {
                    const n = new Set(s);
                    if (n.has(day)) n.delete(day);
                    else n.add(day);
                    return n;
                  })
                }
              >
                {day}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ShareDocument() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Share this document</CardTitle>
        <CardDescription>Anyone with the link can view this document.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex gap-2">
          <Input readOnly value="https://example.com/link/to/document" aria-label="Document link" />
          <Button variant="secondary" className="shrink-0">
            Copy link
          </Button>
        </div>
        <Separator />
        <p className="text-sm font-medium">People with access</p>
        {[
          ["Olivia Martin", "m@example.com", "OM", "Can edit"],
          ["Noah Williams", "n@example.com", "NW", "Can view"],
        ].map(([name, email, initials, role]) => (
          <div key={name} className="flex items-center gap-3">
            <Avatar initials={initials as string} />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-none font-medium">{name}</p>
              <p className="mt-1 text-sm text-(--muted-foreground)">{email}</p>
            </div>
            <Badge variant="secondary">{role}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ReportIssue() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an issue</CardTitle>
        <CardDescription>What area are you having problems with?</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="g-area">Area</Label>
            <Input id="g-area" defaultValue="Billing" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-level">Severity</Label>
            <Input id="g-level" defaultValue="Severity 2" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="g-subject">Subject</Label>
          <Input id="g-subject" placeholder="I need help with…" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="g-desc">Description</Label>
          <Textarea id="g-desc" placeholder="Please include all information relevant to your issue." />
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost">Cancel</Button>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  );
}

function Notifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {[
          ["Your call has been confirmed.", "1 hour ago", true],
          ["You have a new message!", "1 hour ago", true],
          ["Your subscription is expiring soon!", "2 hours ago", false],
        ].map(([title, when, checked]) => (
          <div key={title as string} className="flex items-start gap-3">
            <Checkbox id={`g-n-${title}`} defaultChecked={checked as boolean} className="mt-0.5" />
            <Label htmlFor={`g-n-${title}`} className="flex flex-col items-start gap-1">
              <span>{title}</span>
              <span className="text-sm font-normal text-(--muted-foreground)">{when}</span>
            </Label>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Icon d="M20 6 9 17l-5-5" />
          Mark all as read
        </Button>
      </CardFooter>
    </Card>
  );
}

function Buttons() {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Buttons & badges</CardTitle>
        <CardDescription>Every variant, in the current theme.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/** The sample card from the first version, kept as the gallery's anchor (tests look for it). */
function SampleCard() {
  return (
    <Card role="article" aria-label="Sample card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="size-9 shrink-0 rounded-full bg-linear-to-br from-(--primary) to-(--accent)" />
          <div className="min-w-0">
            <CardTitle className="text-base">Northern Lights</CardTitle>
            <CardDescription className="text-xs">Weekly digest · 4 min</CardDescription>
          </div>
        </div>
        <CardAction>
          <Badge variant="outline">New</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-pretty">
          A quiet summary of what changed this week: three releases, two fixes, and one idea worth a closer look.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">Design</Badge>
          <Badge variant="secondary">Release</Badge>
          <Badge variant="accent">Featured</Badge>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Read</Button>
        <Button variant="outline">Save for later</Button>
      </CardFooter>
    </Card>
  );
}

const COLUMNS: ReactNode[][] = [
  [<CreateAccount key="a" />, <Revenue key="b" />, <CookieSettings key="c" />],
  [<SampleCard key="a" />, <TeamMembers key="b" />, <PaymentMethod key="c" />],
  [<AccountTabs key="a" />, <Chat key="b" />, <Subscriptions key="c" />],
  [<Calendar key="a" />, <MoveGoal key="b" />, <Buttons key="c" />],
  [<ShareDocument key="a" />, <Notifications key="b" />, <ReportIssue key="c" />],
];

export const GALLERY_WIDTH = COLUMNS.length * 360 + (COLUMNS.length - 1) * 24;

/** `run` changes with every new theme so the cards replay their entrance, staggered column by column. */
export function Gallery({ run }: { run: number }) {
  return (
    <div className="flex items-start gap-6" style={{ width: GALLERY_WIDTH }}>
      {COLUMNS.map((col, c) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed layout
        <div key={c} className="flex w-[360px] shrink-0 flex-col gap-6">
          {col.map((item, r) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed layout; `run` re-keys to replay the entrance
            <div key={`${run}-${c}-${r}`} className="m-item" style={{ "--i": c + r * 0.6 } as CSSProperties}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
