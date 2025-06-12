// Mock data for demonstration
export const MOCK_NOTEBOOKS = [
  {
    id: "nb-001",
    title: "Research Notes",
    coverImage:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    totalPages: 24,
    lastUpdated: "2023-05-15T14:30:00Z",
    isPublic: true,
    pin: null,
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nb-001",
    pages: Array.from({ length: 24 }, (_, i) => ({
      id: `pg-${i + 1}`,
      pageNumber: i + 1,
      imageUrl: `https://picsum.photos/seed/${i + 1}/500/700`,
      lastUpdated: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      tags: i % 3 === 0 ? ["important", "review"] : i % 2 === 0 ? ["notes"] : ["draft"],
      notes: i % 4 === 0 ? "Need to review this content before exam" : "",
    })),
  },
  {
    id: "nb-002",
    title: "Project Planning",
    coverImage:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    totalPages: 18,
    lastUpdated: "2023-05-10T09:15:00Z",
    isPublic: false,
    pin: "1234",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nb-002",
    pages: Array.from({ length: 18 }, (_, i) => ({
      id: `pg-${i + 1}`,
      pageNumber: i + 1,
      imageUrl: `https://picsum.photos/seed/${i + 100}/500/700`,
      lastUpdated: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      tags: i % 5 === 0 ? ["milestone", "critical"] : i % 3 === 0 ? ["task"] : ["idea"],
      notes: i % 6 === 0 ? "Discuss with team during next meeting" : "",
    })),
  },
  {
    id: "nb-003",
    title: "Lecture Notes",
    coverImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    totalPages: 32,
    lastUpdated: "2023-05-18T11:45:00Z",
    isPublic: true,
    pin: null,
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nb-003",
    pages: Array.from({ length: 32 }, (_, i) => ({
      id: `pg-${i + 1}`,
      pageNumber: i + 1,
      imageUrl: `https://picsum.photos/seed/${i + 200}/500/700`,
      lastUpdated: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      tags: i % 4 === 0 ? ["exam", "important"] : i % 2 === 0 ? ["concept"] : ["example"],
      notes: i % 5 === 0 ? "This will be on the final exam" : "",
    })),
  },
]

