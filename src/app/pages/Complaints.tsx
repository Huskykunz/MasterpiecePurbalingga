import { Link, useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useComplaints } from "../context/ComplaintContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { MessageCircle, ArrowLeft, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

export default function Complaints() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getUserComplaints } = useComplaints();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const complaints = getUserComplaints(user.id);

  const statusMap = {
    open: {
      label: "Terbuka",
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
    },
    "in-progress": {
      label: "Sedang Ditangani",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    resolved: {
      label: "Terselesaikan",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    closed: {
      label: "Ditutup",
      color: "bg-gray-100 text-gray-800",
      icon: XCircle,
    },
  };

  const categoryMap = {
    product: "Produk",
    delivery: "Pengiriman",
    service: "Pelayanan",
    payment: "Pembayaran",
    other: "Lainnya",
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Keluhan Saya</h1>
          </div>
          <Link to="/complaint">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Keluhan Baru
            </Button>
          </Link>
        </div>

        {complaints.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum ada keluhan</h3>
              <p className="text-gray-600 mb-6">
                Anda belum pernah membuat keluhan
              </p>
              <Link to="/complaint">
                <Button>Buat Keluhan</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const StatusIcon = statusMap[complaint.status].icon;
              return (
                <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                          <Badge variant="secondary">
                            {categoryMap[complaint.category]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {complaint.id}
                          {complaint.orderId && ` • Pesanan: ${complaint.orderId}`}
                        </p>
                      </div>
                      <Badge className={statusMap[complaint.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusMap[complaint.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {complaint.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        Dibuat {new Date(complaint.createdAt).toLocaleDateString("id-ID")}
                        {complaint.responses && complaint.responses.length > 0 && (
                          <span className="ml-3 text-blue-600">
                            • {complaint.responses.length} Respon
                          </span>
                        )}
                      </div>
                      <Link to={`/complaint/${complaint.id}`}>
                        <Button variant="outline" size="sm">
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
