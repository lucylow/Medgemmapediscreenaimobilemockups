import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import {
  Child,
  ScreeningSession,
  ScreeningResult,
  UserRole,
  DomainType,
  AnswerValue,
  DomainAnswer,
} from "../data/types";
import { getQuestionsForAge } from "../data/questions";
import { evaluateScreening } from "../data/screeningEngine";
import * as storage from "../data/storage";

interface AppState {
  role: UserRole | null;
  children: Child[];
  sessions: ScreeningSession[];
  results: ScreeningResult[];
  currentSession: ScreeningSession | null;
}

interface AppContextType extends AppState {
  setRole: (role: UserRole) => void;
  addChild: (child: Omit<Child, "id" | "createdAt">) => Child;
  updateChild: (child: Child) => void;
  removeChild: (childId: string) => void;
  getChild: (childId: string) => Child | undefined;
  startSession: (childId: string, ageMonths: number) => ScreeningSession;
  setSelectedDomains: (domains: DomainType[]) => void;
  setAnswer: (domain: DomainType, questionId: string, answer: AnswerValue) => void;
  setParentConcerns: (text: string) => void;
  submitSession: () => ScreeningResult | null;
  cancelSession: () => void;
  getSessionsForChild: (childId: string) => ScreeningSession[];
  getResultsForChild: (childId: string) => ScreeningResult[];
  getResultForSession: (sessionId: string) => ScreeningResult | undefined;
  clearData: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children: childrenProp }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    role: storage.getUserRole(),
    children: storage.getChildren(),
    sessions: storage.getSessions(),
    results: storage.getResults(),
    currentSession: null,
  });

  const refreshData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      children: storage.getChildren(),
      sessions: storage.getSessions(),
      results: storage.getResults(),
    }));
  }, []);

  const setRole = useCallback((role: UserRole) => {
    storage.setUserRole(role);
    setState((prev) => ({ ...prev, role }));
  }, []);

  const addChild = useCallback((childData: Omit<Child, "id" | "createdAt">): Child => {
    const child: Child = {
      ...childData,
      id: storage.generateId(),
      createdAt: new Date().toISOString(),
    };
    storage.saveChild(child);
    setState((prev) => ({ ...prev, children: storage.getChildren() }));
    return child;
  }, []);

  const updateChild = useCallback((child: Child) => {
    storage.saveChild(child);
    setState((prev) => ({ ...prev, children: storage.getChildren() }));
  }, []);

  const removeChild = useCallback((childId: string) => {
    storage.deleteChild(childId);
    setState((prev) => ({
      ...prev,
      children: storage.getChildren(),
      sessions: storage.getSessions(),
      results: storage.getResults(),
    }));
  }, []);

  const getChild = useCallback(
    (childId: string) => state.children.find((c) => c.id === childId),
    [state.children]
  );

  const startSession = useCallback(
    (childId: string, ageMonths: number): ScreeningSession => {
      const ageBand = getQuestionsForAge(ageMonths);
      const domains: DomainAnswer[] = (Object.keys(ageBand.domains) as DomainType[]).map(
        (domain) => ({
          domain,
          questions: ageBand.domains[domain].map((q) => ({ ...q, answer: null })),
        })
      );

      const session: ScreeningSession = {
        id: storage.generateId(),
        childId,
        createdAt: new Date().toISOString(),
        ageMonths,
        domains,
        parentConcernsText: "",
        media: [],
        status: "draft",
      };

      setState((prev) => ({ ...prev, currentSession: session }));
      return session;
    },
    []
  );

  const setSelectedDomains = useCallback((domains: DomainType[]) => {
    setState((prev) => {
      if (!prev.currentSession) return prev;
      const filtered = prev.currentSession.domains.filter((da) =>
        domains.includes(da.domain)
      );
      return {
        ...prev,
        currentSession: { ...prev.currentSession, domains: filtered },
      };
    });
  }, []);

  const setAnswer = useCallback(
    (domain: DomainType, questionId: string, answer: AnswerValue) => {
      setState((prev) => {
        if (!prev.currentSession) return prev;
        const updatedDomains = prev.currentSession.domains.map((da) => {
          if (da.domain !== domain) return da;
          return {
            ...da,
            questions: da.questions.map((q) =>
              q.id === questionId ? { ...q, answer } : q
            ),
          };
        });
        return {
          ...prev,
          currentSession: { ...prev.currentSession, domains: updatedDomains },
        };
      });
    },
    []
  );

  const setParentConcerns = useCallback((text: string) => {
    setState((prev) => {
      if (!prev.currentSession) return prev;
      return {
        ...prev,
        currentSession: { ...prev.currentSession, parentConcernsText: text },
      };
    });
  }, []);

  const submitSession = useCallback((): ScreeningResult | null => {
    const session = state.currentSession;
    if (!session) return null;

    const submittedSession: ScreeningSession = { ...session, status: "submitted" };
    storage.saveSession(submittedSession);

    const result = evaluateScreening(submittedSession);
    storage.saveResult(result);

    setState((prev) => ({
      ...prev,
      currentSession: null,
      sessions: storage.getSessions(),
      results: storage.getResults(),
    }));

    return result;
  }, [state.currentSession]);

  const cancelSession = useCallback(() => {
    setState((prev) => ({ ...prev, currentSession: null }));
  }, []);

  const getSessionsForChild = useCallback(
    (childId: string) => state.sessions.filter((s) => s.childId === childId),
    [state.sessions]
  );

  const getResultsForChild = useCallback(
    (childId: string) => state.results.filter((r) => r.childId === childId),
    [state.results]
  );

  const getResultForSession = useCallback(
    (sessionId: string) => state.results.find((r) => r.sessionId === sessionId),
    [state.results]
  );

  const clearData = useCallback(() => {
    storage.clearAllData();
    setState({
      role: null,
      children: [],
      sessions: [],
      results: [],
      currentSession: null,
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setRole,
        addChild,
        updateChild,
        removeChild,
        getChild,
        startSession,
        setSelectedDomains,
        setAnswer,
        setParentConcerns,
        submitSession,
        cancelSession,
        getSessionsForChild,
        getResultsForChild,
        getResultForSession,
        clearData,
        refreshData,
      }}
    >
      {childrenProp}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
