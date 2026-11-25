# Model development plan

1. Define narrowly observable labels: dog vocalization present/absent, bark event count, and context supplied by the owner/annotator.
2. Collect recordings only with informed owner consent; document dog identity pseudonymously and avoid collecting unnecessary personal data.
3. Record context separately from the audio label. Do not label an emotion from a bark alone.
4. Split evaluation by dog, not random audio clip, to avoid leakage from the same animal across train/test.
5. Establish a simple baseline and report precision, recall, F1, confusion matrix, calibration and subgroup performance.
6. Add context/emotion hypotheses only after qualified behavioural experts define annotation protocols and inter-rater agreement is measured.
7. Do not generate human sentences or dog-like reverse barks as claimed translations.
