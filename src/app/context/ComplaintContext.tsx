import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Complaint, ComplaintResponse } from "../types";

interface ComplaintContextType {
  complaints: Complaint[];
  createComplaint: (
    userId: string,
    userName: string,
    orderId: string | undefined,
    category: Complaint["category"],
    subject: string,
    description: string
  ) => void;
  getUserComplaints: (userId: string) => Complaint[];
  getComplaint: (complaintId: string) => Complaint | undefined;
  updateComplaintStatus: (complaintId: string, status: Complaint["status"]) => void;
  addResponse: (complaintId: string, responderId: string, responderName: string, message: string) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem("complaints");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("complaints", JSON.stringify(complaints));
  }, [complaints]);

  const createComplaint = (
    userId: string,
    userName: string,
    orderId: string | undefined,
    category: Complaint["category"],
    subject: string,
    description: string
  ) => {
    const newComplaint: Complaint = {
      id: `CPL-${Date.now()}`,
      userId,
      userName,
      orderId,
      category,
      subject,
      description,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
  };

  const getUserComplaints = (userId: string) => {
    return complaints.filter((complaint) => complaint.userId === userId);
  };

  const getComplaint = (complaintId: string) => {
    return complaints.find((complaint) => complaint.id === complaintId);
  };

  const updateComplaintStatus = (complaintId: string, status: Complaint["status"]) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, status, updatedAt: new Date().toISOString() }
          : complaint
      )
    );
  };

  const addResponse = (
    complaintId: string,
    responderId: string,
    responderName: string,
    message: string
  ) => {
    const response: ComplaintResponse = {
      id: `RES-${Date.now()}`,
      complaintId,
      responderId,
      responderName,
      message,
      createdAt: new Date().toISOString(),
    };

    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === complaintId
          ? {
              ...complaint,
              responses: [...(complaint.responses || []), response],
              updatedAt: new Date().toISOString(),
            }
          : complaint
      )
    );
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        createComplaint,
        getUserComplaints,
        getComplaint,
        updateComplaintStatus,
        addResponse,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error("useComplaints must be used within a ComplaintProvider");
  }
  return context;
}
