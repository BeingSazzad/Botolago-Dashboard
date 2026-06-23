/**
 * Brand theme presets. Each preset is a full primary palette expressed as RGB
 * channels (space-separated) so Tailwind's `rgb(var(--primary-x) / <alpha>)`
 * colours can be re-themed live by setting CSS variables on :root.
 */

export interface Theme {
  key: string
  label: string
  /** Representative swatch (the 600 shade) for the picker. */
  swatch: string
  scale: Record<string, string>
}

export const THEMES: Record<string, Theme> = {
  blue: {
    key: 'blue',
    label: 'Royal Blue',
    swatch: '#1d4ed8',
    scale: {
      50: '238 244 255',
      100: '219 230 255',
      200: '189 210 255',
      300: '144 180 255',
      400: '91 139 255',
      500: '47 107 255',
      600: '29 78 216',
      700: '26 67 189',
      800: '27 58 153',
      900: '28 53 120',
      950: '21 33 73',
    },
  },
  indigo: {
    key: 'indigo',
    label: 'Indigo',
    swatch: '#4f46e5',
    scale: {
      50: '238 242 255',
      100: '224 231 255',
      200: '199 210 254',
      300: '165 180 252',
      400: '129 140 248',
      500: '99 102 241',
      600: '79 70 229',
      700: '67 56 202',
      800: '55 48 163',
      900: '49 46 129',
      950: '30 27 75',
    },
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald',
    swatch: '#059669',
    scale: {
      50: '236 253 245',
      100: '209 250 229',
      200: '167 243 208',
      300: '110 231 183',
      400: '52 211 153',
      500: '16 185 129',
      600: '5 150 105',
      700: '4 120 87',
      800: '6 95 70',
      900: '6 78 59',
      950: '2 44 34',
    },
  },
  violet: {
    key: 'violet',
    label: 'Violet',
    swatch: '#7c3aed',
    scale: {
      50: '245 243 255',
      100: '237 233 254',
      200: '221 214 254',
      300: '196 181 253',
      400: '167 139 250',
      500: '139 92 246',
      600: '124 58 237',
      700: '109 40 217',
      800: '91 33 182',
      900: '76 29 149',
      950: '46 16 101',
    },
  },
  rose: {
    key: 'rose',
    label: 'Rose',
    swatch: '#e11d48',
    scale: {
      50: '255 241 242',
      100: '255 228 230',
      200: '254 205 211',
      300: '253 164 175',
      400: '251 113 133',
      500: '244 63 94',
      600: '225 29 72',
      700: '190 18 60',
      800: '159 18 57',
      900: '136 19 55',
      950: '76 5 25',
    },
  },
  amber: {
    key: 'amber',
    label: 'Amber',
    swatch: '#d97706',
    scale: {
      50: '255 251 235',
      100: '254 243 199',
      200: '253 230 138',
      300: '252 211 77',
      400: '251 191 36',
      500: '245 158 11',
      600: '217 119 6',
      700: '180 83 9',
      800: '146 64 14',
      900: '120 53 15',
      950: '69 26 3',
    },
  },
}

export const THEME_LIST = Object.values(THEMES)

export const DEFAULT_THEME_KEY = 'blue'

/** Apply a theme by writing its palette to CSS variables on :root. */
export function applyTheme(key: string): void {
  const theme = THEMES[key] ?? THEMES[DEFAULT_THEME_KEY]
  const root = document.documentElement
  for (const [shade, channels] of Object.entries(theme.scale)) {
    root.style.setProperty(`--primary-${shade}`, channels)
  }
}
