# Vocabulary - Browser Extension Product Roadmap

## Product Overview

**Vision**: A browser sidebar extension that helps users learn and manage vocabulary through sentence translation and word extraction.

**Target Users**: Language learners who want to build their vocabulary while browsing the web.

**Platform**: Chrome and Edge browsers (Manifest V3)

---

## User Personas

### Primary Persona: Sarah - The Active Language Learner
- **Age**: 25-35
- **Goal**: Build vocabulary while reading articles and browsing the web
- **Pain Points**:
  - Switching between browser and vocabulary apps is disruptive
  - Hard to remember context of individual words without sentences
  - Managing multiple vocabulary lists is cumbersome
- **Needs**: Quick, frictionless way to save and organize vocabulary with context

---

## Product Principles

1. **Frictionless**: Minimize clicks and context switching
2. **Contextual**: Always preserve sentence context with vocabulary
3. **Reliable**: Prevent duplicates and ensure data consistency
4. **Organized**: Enable flexible vocabulary list management

---

## Feature Roadmap

### MVP (Minimum Viable Product) - Phase 1

**Goal**: Launch a functional sidebar extension with core translation and vocabulary saving features.

**Success Metrics**:
- User can translate sentences and save words within 3 clicks
- 95% of vocabulary additions succeed without duplicates
- Extension loads in <2 seconds

#### Epic 1: Browser Extension Infrastructure
**Priority**: P0 (Must Have)
**Effort**: 3-5 days

##### User Story 1.1: Sidebar Extension Setup
**As a** language learner
**I want** to access the Volcabulary extension from my browser sidebar
**So that** I can use it without disrupting my browsing experience

**Acceptance Criteria**:
- [ ] Extension appears in Chrome sidebar
- [ ] Extension appears in Edge sidebar
- [ ] Sidebar can be opened/closed via icon click
- [ ] Extension persists across browser sessions
- [ ] Manifest V3 compliant

**Technical Requirements**:
- Use Chrome Extension Manifest V3
- Implement sidebar panel API
- Configure Cross-browser compatibility (Chrome & Edge)

---

#### Epic 2: Sentence Translation & Input
**Priority**: P0 (Must Have)
**Effort**: 5-7 days

##### User Story 2.1: Sentence Input
**As a** user
**I want** to input sentences into the extension
**So that** I can translate text I encounter while browsing

**Acceptance Criteria**:
- [ ] Text input field is visible and accessible in sidebar
- [ ] Input accepts multi-line text (up to 500 characters)
- [ ] Input has clear placeholder text
- [ ] User can clear input with a single action
- [ ] Input validates for empty submissions

**UI/UX Requirements**:
- Textarea with 3-5 line minimum height
- Character counter (500 max)
- Clear button (X icon)
- Submit button (primary action)

##### User Story 2.2: Sentence Translation
**As a** user
**I want** to translate the sentence I input
**So that** I can understand its meaning

**Acceptance Criteria**:
- [ ] Translation API is called when user submits sentence
- [ ] Translation result displays below input
- [ ] Loading state shows during API call
- [ ] Error state shows if translation fails
- [ ] User can retry failed translations
- [ ] Source and target languages are configurable

**Technical Requirements**:
- Integrate translation API (Google Translate, DeepL, or similar)
- Implement retry logic with exponential backoff
- Cache translations to reduce API calls
- Handle rate limiting gracefully

---

#### Epic 3: Word Extraction & Vocabulary Management
**Priority**: P0 (Must Have)
**Effort**: 7-10 days

##### User Story 3.1: Word Breakdown Display
**As a** user
**I want** to see individual words from my translated sentence
**So that** I can select which words to save

**Acceptance Criteria**:
- [ ] Sentence is broken down into individual words/tokens
- [ ] Each word is displayed as a clickable element
- [ ] Words maintain sentence order
- [ ] Punctuation is handled correctly
- [ ] Common words (articles, etc.) can be filtered out

**UI/UX Requirements**:
- Display words as chips/tags
- Highlight selected words
- Show word translation on hover/click
- Visual indicator for already-saved words

##### User Story 3.2: Add Word to Vocabulary List
**As a** user
**I want** to add selected words to my vocabulary list
**So that** I can review them later

**Acceptance Criteria**:
- [ ] User can click a word to select it
- [ ] User can add selected word(s) to a vocabulary list
- [ ] Word is saved with its sentence context
- [ ] Word is saved with its translation
- [ ] Success confirmation is shown
- [ ] Word immediately appears in vocabulary list

**Data Model**:
```typescript
interface VocabularyEntry {
  id: string
  word: string
  translation: string
  sourceLanguage: string
  targetLanguage: string
  sentence: string
  sentenceTranslation: string
  listId: string
  createdAt: Date
  userId: string
}
```

##### User Story 3.3: Default Vocabulary List
**As a** new user
**I want** to have a default vocabulary list automatically created
**So that** I can start saving words immediately without setup

**Acceptance Criteria**:
- [ ] Default list is created on first extension use
- [ ] Default list is named "My Vocabulary" or similar
- [ ] Default list is pre-selected for new word additions
- [ ] User can see word count in default list

---

#### Epic 4: Data Integrity & Reliability
**Priority**: P0 (Must Have)
**Effort**: 3-5 days

##### User Story 4.1: Prevent Duplicate Vocabulary Entries
**As a** user
**I want** the system to prevent duplicate words in my list
**So that** my vocabulary list stays clean and organized

**Acceptance Criteria**:
- [ ] System checks if word already exists before adding
- [ ] Duplicate check is case-insensitive
- [ ] Duplicate check considers the specific list
- [ ] User is notified if word already exists
- [ ] User can choose to update existing entry or skip

**Technical Requirements**:
- Implement idempotency keys for API requests
- Use optimistic UI updates with rollback on failure
- Debounce rapid clicks (prevent double-submission)

##### User Story 4.2: Idempotent API Operations
**As a** developer
**I want** API operations to be idempotent
**So that** slow network responses don't create duplicate entries

**Acceptance Criteria**:
- [ ] Each vocabulary addition has a unique request ID
- [ ] Duplicate requests with same ID are handled gracefully
- [ ] API returns appropriate status for duplicate requests
- [ ] Client handles idempotency errors gracefully
- [ ] Request IDs are generated client-side

**Technical Implementation**:
```typescript
// Generate idempotent key
const idempotencyKey = `${userId}-${word}-${listId}-${Date.now()}`

// Include in API request headers
headers: {
  'Idempotency-Key': idempotencyKey
}

// Server-side: Check if key exists in cache/DB before processing
```

---

### Phase 2: Enhanced Vocabulary Management

**Goal**: Enable users to organize vocabulary into multiple custom lists.

**Timeline**: After MVP launch

#### Epic 5: Custom Vocabulary Lists
**Priority**: P1 (Should Have)
**Effort**: 5-7 days

##### User Story 5.1: Create New Vocabulary List
**As a** user
**I want** to create custom vocabulary lists
**So that** I can organize words by topic or difficulty

**Acceptance Criteria**:
- [ ] User can create new lists via UI
- [ ] User must provide a list name
- [ ] List names must be unique per user
- [ ] User can set optional list description
- [ ] User can choose list color/icon
- [ ] New list appears in list selector immediately

##### User Story 5.2: Manage Multiple Lists
**As a** user
**I want** to switch between vocabulary lists
**So that** I can add words to the appropriate list

**Acceptance Criteria**:
- [ ] Dropdown/selector shows all user lists
- [ ] Current list is clearly indicated
- [ ] User can switch lists without losing input
- [ ] Each list shows word count
- [ ] User can rename lists
- [ ] User can delete lists (with confirmation)

##### User Story 5.3: Move Words Between Lists
**As a** user
**I want** to move words between lists
**So that** I can reorganize my vocabulary

**Acceptance Criteria**:
- [ ] User can select multiple words
- [ ] User can choose target list from dropdown
- [ ] Words are moved atomically
- [ ] User receives confirmation of move
- [ ] Move operation is undoable

---

### Phase 3: Future Enhancements (Backlog)

#### Epic 6: Browser Context Integration
**Priority**: P2 (Nice to Have)

- **Story**: Auto-capture selected text from web pages
- **Story**: Right-click context menu integration
- **Story**: Highlight and translate on hover

#### Epic 7: Learning Features
**Priority**: P2 (Nice to Have)

- **Story**: Spaced repetition review system
- **Story**: Quiz/flashcard mode
- **Story**: Progress tracking and statistics

#### Epic 8: Collaboration & Sync
**Priority**: P3 (Future)

- **Story**: Cross-device synchronization
- **Story**: Share vocabulary lists with others
- **Story**: Import/export vocabulary lists

---

## Technical Architecture

### Extension Components

```
volcabulary-extension/
├── manifest.json           # Extension manifest (V3)
├── src/
│   ├── sidepanel/         # Sidebar UI (React)
│   │   ├── components/
│   │   │   ├── SentenceInput.tsx
│   │   │   ├── TranslationDisplay.tsx
│   │   │   ├── WordBreakdown.tsx
│   │   │   ├── VocabularyList.tsx
│   │   │   └── ListSelector.tsx
│   │   └── App.tsx
│   ├── background/        # Service worker
│   │   └── service-worker.ts
│   ├── api/              # API client (tRPC)
│   │   └── client.ts
│   └── utils/
│       ├── translation.ts
│       └── idempotency.ts
└── public/
    └── icons/
```

### Backend Integration

- **Existing Backend**: Use existing `@volcabulary/web` Next.js API (tRPC)
- **New Endpoints Needed**:
  - `vocabulary.addWord` (mutation, idempotent)
  - `vocabulary.getList` (query)
  - `vocabulary.createList` (mutation)
  - `vocabulary.checkDuplicate` (query)
  - `translation.translate` (query, cached)

### Data Storage

- **Extension Local Storage**: Cache recent translations
- **Backend Database**: Persistent vocabulary lists
- **Sync**: Real-time sync via WebSocket (existing)

---

## Success Metrics & KPIs

### MVP Success Criteria

1. **Adoption**: 100+ active users within 2 weeks of launch
2. **Engagement**: Average 5+ words saved per user per day
3. **Reliability**: <1% duplicate entry rate
4. **Performance**: 95th percentile response time <1s
5. **Retention**: 60% weekly active user retention

### Quality Metrics

- **Crash Rate**: <0.1%
- **API Error Rate**: <2%
- **Translation Accuracy**: User-reported issues <5%

---

## Risk & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Translation API rate limits | High | Medium | Implement caching, retry logic, and fallback API |
| Browser compatibility issues | Medium | Low | Test on Chrome & Edge, use polyfills |
| Duplicate entries from slow API | Medium | Medium | Implement robust idempotency with client-side deduplication |
| User data loss | High | Low | Implement auto-save, WebSocket sync, and local backup |

---

## Development Milestones

### Sprint 1 (Week 1-2): Foundation
- [ ] Extension manifest and sidebar setup
- [ ] Basic UI components
- [ ] API client integration

### Sprint 2 (Week 3-4): Core Features
- [ ] Translation integration
- [ ] Word breakdown logic
- [ ] Add to vocabulary flow

### Sprint 3 (Week 5-6): Reliability & Polish
- [ ] Idempotency implementation
- [ ] Duplicate prevention
- [ ] Error handling and edge cases
- [ ] UI/UX polish

### Sprint 4 (Week 7): Testing & Launch
- [ ] End-to-end testing
- [ ] Beta user testing
- [ ] Bug fixes
- [ ] Chrome Web Store submission

---

## Open Questions & Decisions Needed

1. **Translation API**: Which service? (Google Translate, DeepL, Azure, custom?)
2. **Language Pairs**: Which languages to support initially?
3. **Authentication**: Use existing user system or extension-specific auth?
4. **Pricing**: Free tier limits? Premium features?
5. **Word Breakdown**: Use simple space-split or NLP tokenization?
6. **Offline Mode**: Should extension work offline with cached data?

---

## Appendix

### Competitive Analysis

- **Lingvo**: Good translation, but lacks context saving
- **Vocabla**: Great list management, but no browser integration
- **Google Translate Extension**: Fast translation, but no vocabulary management

**Differentiation**: Volcabulary combines translation with context-aware vocabulary management in a seamless sidebar experience.