# 🎌 Next Session: Build IKIGAI QUEST

**Status:** Foundation Ready, AI Sensei Service Created  
**Assets:** Sensei characters, Japanese gardens, cherry blossoms, Ikigai diagram ✅  
**Estimated Time:** 3-4 hours for complete interactive activity

---

## ✅ READY TO BUILD

### Assets in `/public/`:
- ✅ **6 Sensei characters**: Untitled (30-35).png (red & black robes, different poses)
- ✅ **2 Japanese garden backgrounds**: japanese-pagoda-and-fuji-mount.png, Japan-pink-garden...png
- ✅ **Cherry blossom**: cherry-blossom.png
- ✅ **Ikigai diagram**: Untitled (25).png

### Code Ready:
- ✅ **AI Sensei service**: `src/lib/ai/sensei.ts`
  - getSenseiWelcome()
  - getSenseiGuidance() 
  - getSenseiSuggestions()
  - evaluateIkigai()
- ✅ **Anthropic API**: Already configured, same key as activity assignment

---

## 🎯 BUILD PLAN

### **Component Structure:**

```
src/app/portal/activities/P_ikigai_mini_map/
├── page.tsx                    - Main activity wrapper
├── components/
│   ├── IkigaiIntro.tsx        - Welcome screen with Sensei
│   ├── Step1Love.tsx          - What you LOVE
│   ├── Step2GoodAt.tsx        - What you're GOOD AT  
│   ├── Step3Reflect.tsx       - LET IT REST reflection
│   ├── Step4PaidFor.tsx       - What you can be PAID FOR
│   ├── Step5WorldNeeds.tsx    - What the WORLD NEEDS
│   ├── Step6Synthesis.tsx     - Final Ikigai diagram
│   ├── SenseiGuide.tsx        - AI Sensei speech bubbles
│   ├── IdeaInput.tsx          - Add/edit ideas interface
│   └── FinalDiagram.tsx       - Generate visual Ikigai
```

### **6-Step Flow:**

**Intro Screen:**
- Sensei welcomes student
- Explains Ikigai concept
- Shows final diagram preview
- "Begin Your Quest" button

**Step 1: What You LOVE** (Internal)
- Sensei: "What makes you truly happy?"
- Student adds ideas (text input + Enter)
- AI suggests 4 ideas based on their inputs
- Click suggestion to add
- Progress: 1/6
- "Next" when ≥3 ideas

**Step 2: What You're GOOD AT** (Internal)
- Sensei: "Now think about your strengths..."
- Shows Step 1 ideas for reference
- Student adds skills/talents
- AI suggests based on their loves
- Progress: 2/6
- "Next" when ≥3 ideas

**Step 3: LET IT REST** (Reflection)
- Sensei: "Take a moment to reflect..."
- Shows all ideas from Steps 1 & 2
- Text area for reflection notes
- Gentle animations (falling cherry blossoms)
- "Continue" button

**Step 4: What You Can Be PAID FOR** (External)
- Sensei: "Think practically about earning..."
- Shows internal ideas (love + good at)
- Student adds potential careers/income sources
- AI suggests realistic options for their age
- Progress: 4/6

**Step 5: What The WORLD NEEDS** (External)
- Sensei: "How can you serve others?"
- Shows all previous ideas
- Student adds ways to contribute
- AI suggests based on their profile
- Progress: 5/6

**Step 6: YOUR IKIGAI** (Synthesis)
- Sensei: "Look at the beautiful pattern emerging..."
- Generate visual Ikigai diagram
- Highlight overlaps:
  - Passion (Love + Good At)
  - Mission (Love + World Needs)
  - Profession (Good At + Paid For)
  - Vocation (Paid For + World Needs)
  - **IKIGAI** (center where all 4 meet)
- Show selected ideas in each overlap
- Celebration animation
- Points reveal (150-300 points!)
- Badge unlock: 🎌 "Ikigai Explorer"

---

## 🎨 DESIGN FEATURES

### Visual Theme:
- Background: Japanese garden with Mt. Fuji
- Sensei: Red robe (welcoming pose) → Black robe (meditation) → changes per step
- Cherry blossoms: Gentle falling animation overlay
- Colors: Soft pinks, purples, golds
- Font: Clean sans-serif (readable for students)

### Interactions:
- Sensei speech bubbles with typing animation
- Ideas appear as colored cards/tags
- Drag to reorder (optional Phase 2)
- Click AI suggestions to add instantly
- Smooth step transitions
- Progress bar at top

### Mobile Optimization:
- Vertical layout on mobile
- Large touch targets for adding ideas
- Swipe between steps
- Bottom "Next" button always visible

---

## 💾 DATA STRUCTURE

```typescript
interface IkigaiSubmission {
  activity_code: 'P_ikigai_mini_map'
  evidence_data: {
    step1_love: string[]           // 3-10 ideas
    step2_good_at: string[]        // 3-10 ideas
    step3_reflection: string       // Text reflection
    step4_paid_for: string[]       // 3-10 ideas
    step5_world_needs: string[]    // 3-10 ideas
    step6_overlaps: {
      passion: string[]
      mission: string[]
      profession: string[]
      vocation: string[]
      ikigai_center: string[]      // The magic intersection!
    }
    ai_sensei_messages: SenseiMessage[]
    points_earned: number          // 150-300
    time_spent_minutes: number
    diagram_screenshot: string     // Base64 PNG
  }
  approval_status: 'submitted'
  submitted_at: timestamp
}
```

---

## 🎮 GAMIFICATION

**Points Breakdown:**
- Each idea added: +5 points
- Complete a step: +15 points (×6 = 90)
- AI bonus for originality: +0-50 points
- Make connections: +5 per identified overlap
- Complete all 6 steps: +50 BONUS
- **Total:** 150-300 points

**Badges:**
- 🎌 "Ikigai Explorer" (completion)
- 🌸 "Deep Thinker" (15+ total ideas)
- 🎯 "Purpose Found" (3+ ideas in center overlap)

---

## 🤖 AI FEATURES

**Sensei Provides:**
1. Personalized welcome (uses student name)
2. Step-specific guidance (adapts to their ideas)
3. 4 AI suggestions per quadrant
4. Celebrates insights
5. Helps identify overlaps
6. Final evaluation with bonus points

**API Calls:**
- Welcome: 1 call
- Guidance per step: 6 calls
- Suggestions per quadrant: 4 calls (user-triggered)
- Final evaluation: 1 call
- **Total:** ~12 calls per student (~$0.04 cost)

---

## 📋 BUILD CHECKLIST

### Phase 1: Core Functionality (Next Session - 2hrs)
- [ ] Create activity route structure
- [ ] Build 6 step components
- [ ] Integrate AI Sensei guidance
- [ ] Add idea collection UI
- [ ] Implement AI suggestions
- [ ] Create progress tracker
- [ ] Save to database

### Phase 2: Polish (30min)
- [ ] Add Japanese backgrounds
- [ ] Animate Sensei character
- [ ] Cherry blossom overlay
- [ ] Smooth transitions
- [ ] Points animation
- [ ] Badge unlock celebration

### Phase 3: Final Diagram (1hr)
- [ ] Generate visual Ikigai circle diagram
- [ ] Highlight overlaps with colors
- [ ] Export as image
- [ ] Add to evidence
- [ ] Printable version

---

## 🚀 IMPLEMENTATION NOTES

### Background Setup:
```css
background: url('/japanese-pagoda-and-fuji-mount.png')
background-size: cover
background-position: center
```

### Sensei Animation:
```tsx
// Cycle through poses based on step
const senseiPoses = [
  '/Untitled (30).png',  // Welcome (red, arms wide)
  '/Untitled (33).png',  // Meditation (red, praying)
  '/Untitled (32).png',  // Guiding (black, arms open)
  '/Untitled (31).png',  // Contemplation (black)
  '/Untitled (34).png',  // Wisdom (alternative)
  '/Untitled (35).png',  // Celebration (final)
]
```

### Cherry Blossoms:
```tsx
// Floating animation overlay
<div className="cherry-blossoms">
  {[...Array(10)].map((_, i) => (
    <img 
      key={i}
      src="/cherry-blossom.png"
      className="floating-blossom"
      style={{
        animationDelay: `${i * 0.5}s`,
        left: `${Math.random() * 100}%`
      }}
    />
  ))}
</div>
```

---

## 📖 REFERENCE

Student instructions (from your PDF):
- Step 1: List what you love (be specific, exhaustive)
- Step 2: Add what you're good at (be kind to yourself)
- Step 3: Let it rest (let brain process)
- Step 4: What can be paid for? (money vs freedom/creativity)
- Step 5: What does world need? (your worldview matters)
- Step 6: Look for themes emerging (not specific job, but patterns)

Sensei personality:
- Wise but warm
- Encouraging not pushy
- Age-appropriate (11-14 years)
- Brief guidance (2-3 sentences)
- Celebrates progress
- Makes abstract concepts concrete

---

## ✨ VISION

**Student Experience:**
1. Beautiful Japanese garden loads
2. Sensei greets them by name
3. Gentle music (optional future feature)
4. Step-by-step journey with visual progress
5. AI helps them think deeper
6. Final "Aha!" moment seeing their Ikigai
7. Celebration with points & badge
8. Beautiful diagram to save/print

**This Will Be UNFORGETTABLE!** 🎌✨

---

*Ready to build next session - all assets and foundation in place!*

