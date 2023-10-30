import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  AuthCredential,
  browserSessionPersistence,
  UserCredential,
  sendPasswordResetEmail,
  deleteUser,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  CollectionReference,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  FirestoreError,
  DocumentSnapshot,
  DocumentData,
  Unsubscribe,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  sessionCollection!: CollectionReference;
  loggedInUserId!: string;
  userEmailId!: string;
  sessionDocSnap!: Unsubscribe;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.sessionCollection = collection(this.firestore, 'sessions');

    //! Not required (logged user info will be saved in session storage)
    // this.auth.setPersistence(browserSessionPersistence);

    // this.auth.onIdTokenChanged(auth => console.log("I am Id Token function",auth));
  }

  // this function will run before application starts and ready to use
  Init() {
    return new Promise<void>((resolve, reject) => {
      return this.auth.onAuthStateChanged(async (auth) => {
        // todo handle error
        if (auth) {
          this.loggedInUserId = auth.uid;
          this.userEmailId = auth.email!;

          console.log('I am Auth state change function ', auth);
          // Step 3: Revoke all refresh tokens
          const jwtToken = await auth.getIdToken(true);

          // save session into firestore DB
          await setDoc(doc(this.sessionCollection, this.loggedInUserId), {
            uid: this.loggedInUserId,
            sessionId: jwtToken,
          });

          // Subscribe to the session doc
          this.subscribeSessionByDocId(this.loggedInUserId);

          // console.log('Access Token : ', jwtToken);
          // console.log('Refresh Token : ', auth.refreshToken);
          resolve();
        } else {
          this.auth.signOut();
          resolve();
        }
      });
    });
  }

  // this function will keep eyes on session doc if any changes it will match will current auth
  // If both token match then continue otherwise logout user
  async subscribeSessionByDocId(docId: string) {
    this.sessionDocSnap = onSnapshot(doc(this.sessionCollection, docId), {
      next: async (sessionSnap: DocumentSnapshot<DocumentData>) => {
        if (sessionSnap.exists()) {
          const userSessionData = sessionSnap.data();
          console.log('User Session Data', userSessionData);
          const { sessionId } = userSessionData;
          await this.auth.currentUser?.reload();
          // when new changes happens match with
          if (sessionId !== (await this.auth.currentUser?.getIdToken())) {
            this.auth.signOut();
          }

          this.userEmailId = this.auth.currentUser?.email!;
        } else {
          console.log("Session does'nt exists");
          this.auth.signOut();
        }
      },
      error: (error: FirestoreError) => console.log(error.code),
    });
  }

  get isUserLoggedIn() {
    return this.auth.currentUser ? true : false;
  }

  // Function to signup with email and password
  async signUpWithEmailAndPassword(email: string, password: string) {
    console.log('Email', email);
    console.log('Password', password);
    try {
      const response: UserCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      await sendEmailVerification(response.user);
      return { success: true, data: response };
    } catch (err: any) {
      return { success: false, error: err.code };
    }
  }

  // Function to login with email and password
  async logInWithEmailAndPassword(email: string, password: string) {
    console.log('Email', email);
    console.log('Password', password);
    try {
      const res = await signInWithEmailAndPassword(this.auth, email, password);
      // console.log(res);
      return { success: true };
    } catch (err: any) {
      //todo auth/user-not-found
      console.log(err.code);
      return { success: false, error: err.code };
    }
  }

  private async reAuthenticate(currentPassword: string) {
    const credentials: AuthCredential = EmailAuthProvider.credential(
      this.auth.currentUser?.email!,
      currentPassword
    );
    return await reauthenticateWithCredential(
      this.auth.currentUser!,
      credentials
    );
  }

  // * This function will send verification link to the new email id if clicked and verified the automatically email will update
  async verifyAndUpdateEmail(
    newEmail: string,
    currentPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.reAuthenticate(currentPassword);
      await verifyBeforeUpdateEmail(this.auth.currentUser!, newEmail);
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.code };
    }
  }

  // * This function will update email immediately
  async updateEmail(
    newEmail: string,
    currentPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.reAuthenticate(currentPassword);
      await updateEmail(this.auth.currentUser!, newEmail);
      const jwtToken = await this.auth.currentUser?.getIdToken();
      const uid = this.auth.currentUser?.uid;
      await updateDoc(doc(this.sessionCollection, uid), {
        sessionId: jwtToken,
      });
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.code };
    }
  }

  async updatePassword(
    currentPassword: string,
    updatedPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.reAuthenticate(currentPassword);
      await updatePassword(this.auth.currentUser!, updatedPassword);
      const jwtToken = await this.auth.currentUser?.getIdToken();
      const uid = this.auth.currentUser?.uid;
      await updateDoc(doc(this.sessionCollection, uid), {
        sessionId: jwtToken,
      });
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.code };
    }
  }

  async sendResetPasswordLinkToEmail(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.code };
    }
  }

  async deleteUserFromDB(
    currentPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.reAuthenticate(currentPassword);
      this.sessionDocSnap();
      await deleteDoc(doc(this.sessionCollection, this.loggedInUserId));
      await deleteUser(this.auth.currentUser!);
      return { success: true };
    } catch (error: any) {
      console.log(error);
      return { success: false, error: error.code };
    }
  }

  async logOut() {
    this.sessionDocSnap();
    await deleteDoc(doc(this.sessionCollection, this.loggedInUserId));
    await this.auth.signOut();
    this.loggedInUserId = '';
    this.router.navigate(['']);
  }
}
