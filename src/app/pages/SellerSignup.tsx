import { useState } from "react";
import { useNavigate } from "react-router";
import { Store, Upload, CheckCircle, ArrowRight, User, MapPin, Briefcase, FileText, Phone, Mail, BarChart3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";

export default function SellerSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    // Workshop Info
    workshopName: "",
    workshopAddress: "",
    city: "Purbalingga",
    postalCode: "",

    // Experience & Specialization
    yearsOfExperience: "",
    specialization: "",
    bio: "",

    // Documents
    idCard: null as File | null,
    businessLicense: null as File | null,
    workshopPhoto: null as File | null,
  });

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
          toast.error("Harap lengkapi semua data pribadi");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Password tidak cocok");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Password minimal 6 karakter");
          return false;
        }
        return true;

      case 2:
        if (!formData.workshopName || !formData.workshopAddress || !formData.postalCode) {
          toast.error("Harap lengkapi semua data bengkel");
          return false;
        }
        return true;

      case 3:
        if (!formData.yearsOfExperience || !formData.specialization || !formData.bio) {
          toast.error("Harap lengkapi pengalaman dan spesialisasi");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.idCard || !formData.businessLicense || !formData.workshopPhoto) {
      toast.error("Harap unggah semua dokumen yang diperlukan");
      return;
    }

    // Simulate submission
    toast.success("Pendaftaran berhasil!", {
      description: "Akun penjual Anda sedang dalam proses verifikasi. Kami akan menghubungi Anda dalam 1-2 hari kerja.",
    });

    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl">Daftar Sebagai Penjual</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Mulai jual produk knalpot Anda di Masterpiece Purbalingga
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Langkah {currentStep} dari {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% selesai</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-6">
              {[
                { num: 1, label: "Data Pribadi" },
                { num: 2, label: "Info Bengkel" },
                { num: 3, label: "Pengalaman" },
                { num: 4, label: "Dokumen" },
              ].map((step) => (
                <div
                  key={step.num}
                  className={`text-center p-2 rounded-lg ${
                    currentStep === step.num
                      ? "bg-blue-600 text-white"
                      : currentStep > step.num
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <div className="font-semibold text-xs">{step.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Steps */}
        <Card>
          <CardContent className="p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl">Data Pribadi</h2>
                </div>

                <div>
                  <Label>Nama Lengkap *</Label>
                  <Input
                    placeholder="Contoh: Budi Santoso"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        className="pl-10"
                        placeholder="email@contoh.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Nomor Telepon *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        className="pl-10"
                        placeholder="+62 812-3456-7890"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Konfirmasi Password *</Label>
                    <Input
                      type="password"
                      placeholder="Ulangi password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Workshop Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl">Informasi Bengkel</h2>
                </div>

                <div>
                  <Label>Nama Bengkel *</Label>
                  <Input
                    placeholder="Contoh: Bengkel Knalpot Budi"
                    value={formData.workshopName}
                    onChange={(e) => handleInputChange("workshopName", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Alamat Bengkel Lengkap *</Label>
                  <Textarea
                    rows={3}
                    placeholder="Jl. Raya Purbalingga No. 45, Kelurahan..."
                    value={formData.workshopAddress}
                    onChange={(e) => handleInputChange("workshopAddress", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Kota/Kabupaten *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Kode Pos *</Label>
                    <Input
                      placeholder="53311"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tips:</strong> Pastikan alamat bengkel Anda akurat. Ini akan membantu pelanggan menemukan lokasi Anda dengan mudah.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Experience & Specialization */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl">Pengalaman & Spesialisasi</h2>
                </div>

                <div>
                  <Label>Lama Pengalaman (Tahun) *</Label>
                  <Input
                    type="number"
                    placeholder="Contoh: 10"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Spesialisasi *</Label>
                  <Input
                    placeholder="Contoh: Knalpot Racing dan Custom"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Sebutkan jenis knalpot atau layanan yang menjadi keahlian Anda
                  </p>
                </div>

                <div>
                  <Label>Bio / Tentang Bengkel Anda *</Label>
                  <Textarea
                    rows={5}
                    placeholder="Ceritakan tentang bengkel Anda, keahlian, pengalaman, dan apa yang membuat produk Anda berbeda..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Minimal 50 karakter - Bio yang menarik akan meningkatkan kepercayaan pelanggan
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    ⭐ <strong>Saran:</strong> Ceritakan keunikan produk Anda, sertifikasi, atau pencapaian yang membuat bengkel Anda menonjol.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Documents Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl">Unggah Dokumen</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <Label>KTP / Identitas Resmi *</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      className="mt-2"
                      onChange={(e) => handleFileChange("idCard", e.target.files?.[0] || null)}
                    />
                    {formData.idCard && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {formData.idCard.name}
                      </p>
                    )}
                  </div>

                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <Label>Surat Izin Usaha (NIB/SIUP) *</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Untuk memverifikasi legalitas usaha Anda
                    </p>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange("businessLicense", e.target.files?.[0] || null)}
                    />
                    {formData.businessLicense && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {formData.businessLicense.name}
                      </p>
                    )}
                  </div>

                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <Label>Foto Bengkel / Workshop *</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Foto tampak depan atau area kerja bengkel Anda
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("workshopPhoto", e.target.files?.[0] || null)}
                    />
                    {formData.workshopPhoto && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {formData.workshopPhoto.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    🔒 <strong>Keamanan Data:</strong> Semua dokumen Anda akan dienkripsi dan hanya digunakan untuk proses verifikasi. Kami menjaga privasi Anda dengan serius.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2">Proses Selanjutnya:</h3>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Tim kami akan meninjau pendaftaran Anda dalam 1-2 hari kerja</li>
                    <li>Kami akan menghubungi Anda melalui email atau telepon untuk verifikasi</li>
                    <li>Setelah disetujui, akun penjual Anda akan aktif</li>
                    <li>Anda dapat mulai menambahkan produk dan menerima pesanan</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Kembali
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleNext}
                >
                  Lanjut
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Kirim Pendaftaran
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Jangkauan Lebih Luas</h3>
              <p className="text-sm text-gray-600">
                Jual ke seluruh Indonesia tanpa batasan geografis
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Analitik Lengkap</h3>
              <p className="text-sm text-gray-600">
                Dashboard performa untuk pantau penjualan Anda
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Gratis Bergabung</h3>
              <p className="text-sm text-gray-600">
                Tanpa biaya pendaftaran, komisi kompetitif
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
