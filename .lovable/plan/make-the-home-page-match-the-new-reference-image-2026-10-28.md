# Make the home page match the new reference image

Only the signed-out home page changes. Sign-in, sign-up and featured courses keep working as they do now.

## Changes
1. **Top bar:** a deep navy bar with the BridgeLIB shield logo, white menu links (the current page shown in light blue), an outlined Login button and a white Sign Up button. On phones it collapses into the existing mobile menu.
2. **Hero:** a full-width photo of a smiling Liberian schoolgirl holding books, with classmates blurred behind her, fading into navy on the left. The text sits on the left: the shield, then "BridgeLIB" with "LIB" in red, then the large line "Learn Today, Build Tomorrow". Below it, the subtitle, a red "Get Started Free" button (opens sign-up) and an outlined "Watch Video" button with a play icon.
3. **Benefit cards:** four white rounded cards with coloured icons:
   - Quality Education (stopwatch)
   - WASSCE Preparation (graduation cap)
   - Progress Tracking (chart)
   - For a Better Liberia (flag map)

   The image's garbled captions are replaced with clear wording.
4. **"Explore Our Learning Categories":** six cards with icons for Mathematics, English, Science, Social Studies, ICT and Business Studies. Each opens Courses.
5. **Quote bar:** a navy band reading "Education is the key to a brighter future for every Liberian." with a red "Join BridgeLIB Today" button that opens sign-up.
6. Featured courses (from your real data) and the footer stay below the quote bar.

## Technical details
- Generate a new hero photo and a shield logo into `src/assets`.
- Edit the home section of `BridgeApp.tsx` (around lines 1360–1420) and the `bl-*` styles in `styles.css`, using existing tokens plus a red accent token.
- Check with Playwright at 360px and desktop widths.
