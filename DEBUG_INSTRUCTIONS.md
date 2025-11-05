# Debug Instructions for v1

## Changes Made
Added extensive console logging to track sprite loading.

## How to Debug

1. Deploy the changes
2. Open browser console (F12)
3. Test these scenarios:

### Test 1: Child + Walk
Expected logs:
```
?? Loading child walk...
Body paths: [...]
? Loaded: /spritesheets/body/bodies/child/walk/light.png (576x256)
  OR
? Loaded: /spritesheets/body/bodies/child/walk.png (576x256)
Head paths: [...]
? Loaded: /spritesheets/head/heads/human/child/walk.png (576x256)
```

### Test 2: Male + Hurt
Expected logs:
```
?? Loading male hurt...
Body paths: [...]
? Loaded: /spritesheets/body/bodies/male/hurt/light.png (384x64)
Head paths: [...]
? Loaded: /spritesheets/head/heads/human/male/hurt/light.png (??x??)
```

### Test 3: Child + Hurt
Expected logs:
```
?? Loading child hurt...
Body paths: [...]
? Loaded: /spritesheets/body/bodies/child/hurt.png (384x64)
Head paths: [...]
? Loaded: /spritesheets/head/heads/human/child/hurt.png (384x64)
```

## What to Look For

1. **Are the sprites loading?** Look for ? messages
2. **What dimensions?** Check (WxH) in the logs
3. **Which path succeeded?** See which URL actually loaded
4. **Any errors?** Look for ? messages

## Common Issues

- If sprites are 576x256 but render looks wrong ? sprite sheet layout issue
- If sprites are 384x64 ? single-row format (hurt animation)
- If seeing adult head on child ? wrong path loaded (check logs!)
- If hurt not showing ? check if sprite loaded at all

## Next Steps

Send me the console logs from:
1. Selecting CHILD body type (should trigger walk animation load)
2. Clicking HURT animation while on child
3. Selecting MALE body type then HURT animation
