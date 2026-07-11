/**
 * Exercise illustrations — every main lift AND every swap alternative.
 *
 * Real anatomical line art from the Everkinetic open dataset
 * (github.com/everkinetic/data, CC BY-SA 4.0), served from `public/exercise/`
 * so it loads instantly on gym wifi. Two frames per movement — the muscle
 * stretched, then contracted — which reads far better than an animated figure.
 *
 * We do NOT use wger's community image uploads: spot-checking them turned up a
 * dumbbell deadlift filed as "Deadlifts" and a HOIST(R) product photo, watermark
 * and all, uploaded under a CC-BY-SA claim.
 *
 * Files are redistributed unmodified; the dark-theme recolour happens in CSS at
 * display time. See public/exercise/LICENSE.txt.
 *
 * Where Everkinetic has no exact match the closest honest variant is used and
 * `variantNote` says how it differs, shown on screen. One movement (Nordic
 * Curl) has no reasonable match at all and is mapped to null: a wrong picture is
 * worse than none.
 */

export interface Figure {
  /** basename in /exercise: `${slug}-start.svg` and `${slug}-end.svg` */
  slug: string
  /** the Everkinetic illustration this actually depicts */
  source: string
  /** set when the art is the closest honest variant, not an exact match */
  variantNote?: string
}

/** null = deliberately no illustration (nothing honest to show). */
export const FIGURES: Record<string, Figure | null> = {
  'Bench Press': { slug: 'bench-press', source: 'Bench Press' },
  'Overhead Press': { slug: 'overhead-press', source: 'Seated Military Press', variantNote: 'shown seated' },
  'Incline DB Press': { slug: 'incline-db-press', source: 'Incline Dumbbell Press' },
  'Triceps Pushdown': { slug: 'triceps-pushdown', source: 'Triceps Pushdown with Cable' },
  'Lateral Raise': { slug: 'lateral-raise', source: 'Lateral Dumbbell Raises' },
  'Deadlift': { slug: 'deadlift', source: 'Barbell Dead Lifts' },
  'Weighted Pull-up': { slug: 'weighted-pull-up', source: 'Pull Ups' },
  'Barbell Row': { slug: 'barbell-row', source: 'Reverse Grips Bent Over Barbell Rows', variantNote: 'shown underhand' },
  'Lat Pulldown': { slug: 'lat-pulldown', source: 'Underhand Pull down', variantNote: 'shown underhand' },
  'Barbell Curl': { slug: 'barbell-curl', source: 'Biceps Curls with Barbell' },
  'Back Squat': { slug: 'back-squat', source: 'Barbell Squat' },
  'Romanian Deadlift': { slug: 'romanian-deadlift', source: 'Romanian Dead Lift' },
  'Leg Press': { slug: 'leg-press', source: 'Leg Press' },
  'Seated Leg Curl': { slug: 'seated-leg-curl', source: 'Seated Leg Curl' },
  'Standing Calf Raise': { slug: 'standing-calf-raise', source: 'Standing Barbell Calf Raise' },
  'Dumbbell Bench Press': { slug: 'dumbbell-bench-press', source: 'Bench Press Dumbbell' },
  'Machine Chest Press': { slug: 'machine-chest-press', source: 'Machine Bench Press' },
  'Weighted Push-up': { slug: 'weighted-push-up', source: 'Push Ups', variantNote: 'bodyweight shown' },
  'Seated DB Shoulder Press': { slug: 'seated-db-shoulder-press', source: 'One Arm Dumbbell Shoulder Press', variantNote: 'shown one-arm' },
  'Machine Shoulder Press': { slug: 'machine-shoulder-press', source: 'Seated Military Press', variantNote: 'shown with barbell' },
  'Arnold Press': { slug: 'arnold-press', source: 'One Arm Dumbbell Shoulder Press', variantNote: 'dumbbell press shown' },
  'Incline Barbell Press': { slug: 'incline-barbell-press', source: 'Incline Bench Press' },
  'Incline Machine Press': { slug: 'incline-machine-press', source: 'Incline Bench Press', variantNote: 'shown with barbell' },
  'Low-to-High Cable Fly': { slug: 'low-to-high-cable-fly', source: 'Cable Crossover', variantNote: 'crossover shown' },
  'Overhead Cable Extension': { slug: 'overhead-cable-extension', source: 'Standing Overhead Triceps Extension with Barbell', variantNote: 'shown with barbell' },
  'Skull Crushers': { slug: 'skull-crushers', source: 'Lying Triceps Press with Barbell' },
  'Bench Dips': { slug: 'bench-dips', source: 'Bench Dips' },
  'Cable Lateral Raise': { slug: 'cable-lateral-raise', source: 'Lateral Dumbbell Raises', variantNote: 'shown with dumbbell' },
  'Machine Lateral Raise': { slug: 'machine-lateral-raise', source: 'Lateral Dumbbell Raises', variantNote: 'shown with dumbbell' },
  'Upright Row': { slug: 'upright-row', source: 'Upright Barbell Rows' },
  'Trap-Bar Deadlift': { slug: 'trap-bar-deadlift', source: 'Barbell Dead Lifts', variantNote: 'shown with barbell' },
  'Rack Pull': { slug: 'rack-pull', source: 'Barbell Dead Lifts', variantNote: 'shown as full deadlift' },
  'Assisted Pull-up': { slug: 'assisted-pull-up', source: 'Pull Ups', variantNote: 'assist not shown' },
  'Chin-up': { slug: 'chin-up', source: 'Wide Grip Chin Up', variantNote: 'wide grip shown' },
  'Pull-up': { slug: 'pull-up', source: 'Pull Ups' },
  'Dumbbell Row': { slug: 'dumbbell-row', source: 'Reverse Grips Bent Over Barbell Rows', variantNote: 'shown with barbell' },
  'Chest-Supported Row': { slug: 'chest-supported-row', source: 'Seated Cable Rows', variantNote: 'seated cable shown' },
  'Seated Cable Row': { slug: 'seated-cable-row', source: 'Seated Cable Rows' },
  'Straight-Arm Pulldown': { slug: 'straight-arm-pulldown', source: 'Straight Arm Push Down' },
  'Machine Pulldown': { slug: 'machine-pulldown', source: 'V Bar Pull Down', variantNote: 'v-bar shown' },
  'Dumbbell Curl': { slug: 'dumbbell-curl', source: 'Biceps Curl with Dumbbell' },
  'Cable Curl': { slug: 'cable-curl', source: 'Standing Biceps Curl with Cable' },
  'Preacher Curl': { slug: 'preacher-curl', source: 'Preacher Curl with Barbell' },
  'Front Squat': { slug: 'front-squat', source: 'Front Squat with Barbell' },
  'Hack Squat': { slug: 'hack-squat', source: 'Hack Squat Machine' },
  'Goblet Squat': { slug: 'goblet-squat', source: 'Squats using Dumbbells', variantNote: 'shown with dumbbells' },
  'Lying Leg Curl': { slug: 'lying-leg-curl', source: 'Standing Leg Curls', variantNote: 'shown standing' },
  'Good Morning': { slug: 'good-morning', source: 'Barbell Good Mornings' },
  'Dumbbell RDL': { slug: 'dumbbell-rdl', source: 'Romanian Dead Lift', variantNote: 'shown with barbell' },
  'Bulgarian Split Squat': { slug: 'bulgarian-split-squat', source: 'Rear Lunges with Dumbbell', variantNote: 'shown as rear lunge' },
  'Nordic Curl': null,
  'Leg-Press Calf Raise': { slug: 'leg-press-calf-raise', source: 'Calves Press on Leg Machine' },
  'Seated Calf Raise': { slug: 'seated-calf-raise', source: 'Seated Calf Raise with Barbell' },
  'Single-Leg Calf Raise': { slug: 'single-leg-calf-raise', source: 'Seated One Leg Calf Raise with Dumbbell', variantNote: 'shown seated' },
}

/**
 * The illustration for a movement, or null when there is none. Swap
 * alternatives are covered too; only movements with no honest match return null.
 */
export function figureFor(movementName: string): Figure | null {
  return FIGURES[movementName] ?? null
}

export const FIGURE_CREDIT = {
  author: 'Everkinetic',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  sourceUrl: 'https://github.com/everkinetic/data',
}
