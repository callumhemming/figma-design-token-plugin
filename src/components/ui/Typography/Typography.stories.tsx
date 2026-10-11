import type { Meta, StoryObj } from "@storybook/react-vite";

import { Typography, TypographyGutter, TypographyVariant } from "./index";

const variants: TypographyVariant[] = [
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "heading5",
  "heading6",
  "subtitle1",
  "subtitle2",
  "body1",
  "body2",
  "button",
  "caption",
  "overline",
  "inherit",
];
const gutters: TypographyGutter[] = ["none", "xs", "sm", "md", "lg"];

// A rule drawn directly under the text, so the gap between the two is the
// gutter (margin-bottom) the Typography applied.
const rule = {
  height: 1,
  background: "var(--s-color-primary-border)",
  marginBottom: "var(--s-spacing-6)",
};

const meta = {
  title: "Typography",
  component: Typography,
  args: {
    children: "The quick brown fox jumps over the lazy dog",
    variant: "body1",
  },
  argTypes: {
    variant: { control: "select", options: variants },
    gutter: { control: "inline-radio", options: [undefined, ...gutters] },
    as: { control: "text" },
  },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div>
      {variants.map((variant) => (
        <div key={variant}>
          <Typography variant="overline" gutter="xs">
            {variant}
          </Typography>
          <Typography {...args} variant={variant} />
          <div style={rule} />
        </div>
      ))}
    </div>
  ),
};

// Each variant's default gutter: the space between the text and the rule.
export const DefaultGutters: Story = {
  render: (args) => (
    <div>
      {variants.map((variant) => (
        <div key={variant}>
          <Typography {...args} variant={variant}>
            {variant}
          </Typography>
          <div style={rule} />
        </div>
      ))}
    </div>
  ),
};

// Every gutter override on one variant. Resize the canvas to see the
// fluid gutters change between their min and max.
export const GutterOverrides: Story = {
  render: (args) => (
    <div>
      {gutters.map((gutter) => (
        <div key={gutter}>
          <Typography {...args} gutter={gutter}>
            {`gutter="${gutter}"`}
          </Typography>
          <div style={rule} />
        </div>
      ))}
    </div>
  ),
};

// How the default gutters read in running content.
export const Article: Story = {
  render: () => (
    <article style={{ maxWidth: "60ch" }}>
      <Typography variant="overline">Design tokens</Typography>
      <Typography variant="heading1">Building a design system</Typography>
      <Typography variant="subtitle1">
        Primitives, semantics and components
      </Typography>
      <Typography>
        Primitive tokens hold raw values. Semantic tokens give those values a
        purpose, and component tokens configure a single component from the
        semantic layer.
      </Typography>
      <Typography variant="heading2">Spacing</Typography>
      <Typography>
        Spacing is a single rem scale. Fluid tokens clamp between two of its
        steps so they never land off-scale at either end.
      </Typography>
      <Typography variant="heading3">Gutters</Typography>
      <Typography variant="body2">
        Headings sit closer to the content they introduce than paragraphs sit to
        each other.
      </Typography>
      <Typography variant="caption">Last updated October 2026</Typography>
    </article>
  ),
};
