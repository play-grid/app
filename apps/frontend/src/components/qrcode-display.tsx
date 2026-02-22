import { Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Button } from '@/games/five-seconds/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/games/five-seconds/components/ui/dialog';

interface QRCodeDisplayProps {
  inviteUrl: string;
  expiresAt?: string;
  className?: string;
}

export function QRCodeDisplay({ inviteUrl, expiresAt, className }: QRCodeDisplayProps) {
  const [open, setOpen] = useState(false);

  const handleDownload = () => {
    const svg = document.getElementById('qrcode-canvas');
    if (svg instanceof SVGSVGElement) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `invite-qrcode-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  const formatExpiry = (expiresAt?: string) => {
    if (!expiresAt)
      return null;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffHours = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffHours <= 0) {
      const diffMinutes = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60));
      return diffMinutes > 0 ? `Expires in ${diffMinutes} minutes` : 'Expires soon';
    }
    return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share via QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="border shadow-xl p-4 bg-background">
            <QRCodeSVG
              id="qrcode-canvas"
              value={inviteUrl}
              title="Join this game"
              size={200}
              level="L"
              bgColor="var(--background)"
              fgColor="var(--foreground)"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Scan this QR code to join the game
            </p>
            {expiresAt && (
              <p className="text-xs text-muted-foreground">
                {formatExpiry(expiresAt)}
              </p>
            )}
            <p className="text-xs text-muted-foreground break-all max-w-xs">
              {inviteUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
