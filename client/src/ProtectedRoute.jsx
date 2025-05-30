function handleGoogleContinue() {
  if (!googleUser) return;

  const userDoc = doc(db, 'users', googleUser.uid);

  getDoc(userDoc).then((snapshot) => {
    if (!snapshot.exists()) {
      let nameToSave = firstName || googleUser.displayName || googleUser.email.split('@')[0];
      if (firstName && lastName) nameToSave = `${firstName} ${lastName}`;

      setDoc(userDoc, {
        name: nameToSave,
        email: googleUser.email,
        role: role,
        createdAt: new Date()
      }).then(() => {
        // Wait for auth to fully sync before navigating
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe(); // stop listening
            redirectToDashboard(role);
          }
        });
      });
    } else {
      const userRole = snapshot.data().role || 'buyer';
      redirectToDashboard(userRole);
    }
  });
}