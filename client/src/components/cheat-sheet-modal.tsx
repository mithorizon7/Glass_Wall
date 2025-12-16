import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Printer, 
  Lock, 
  Unlock, 
  Shield, 
  ShieldOff,
  Eye,
  EyeOff,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useCallback, useRef } from "react";

interface CheatSheetModalProps {
  trigger?: React.ReactNode;
}

export function CheatSheetModal({ trigger }: CheatSheetModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Network Security Cheat Sheet</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #1a1a1a;
            }
            h1 { 
              text-align: center;
              color: #0f172a;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 16px;
            }
            h2 { 
              color: #1e40af;
              margin-top: 24px;
            }
            .section {
              margin-bottom: 24px;
              padding: 16px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }
            .http { border-left: 4px solid #ef4444; }
            .https { border-left: 4px solid #22c55e; }
            .vpn { border-left: 4px solid #8b5cf6; }
            .comparison-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            .comparison-table th, .comparison-table td {
              border: 1px solid #e2e8f0;
              padding: 12px;
              text-align: left;
            }
            .comparison-table th {
              background: #f1f5f9;
            }
            .good { color: #16a34a; }
            .bad { color: #dc2626; }
            .tips {
              background: #fef3c7;
              padding: 16px;
              border-radius: 8px;
              margin-top: 24px;
            }
            .tips h3 { margin-top: 0; color: #92400e; }
            .tips ul { margin-bottom: 0; }
            @media print {
              body { padding: 20px; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Network Security Cheat Sheet</h1>
          
          <div class="section http">
            <h2>HTTP (Insecure)</h2>
            <ul>
              <li>Data travels in <strong>plain text</strong> - anyone on the network can read it</li>
              <li>Passwords, usernames, and personal data are <strong>visible</strong></li>
              <li>No protection against eavesdropping on public Wi-Fi</li>
              <li>Look for: <code>http://</code> in the address bar (no lock icon)</li>
            </ul>
          </div>

          <div class="section https">
            <h2>HTTPS (Secure)</h2>
            <ul>
              <li>Data is <strong>encrypted</strong> before sending</li>
              <li>Passwords and personal data appear as <strong>scrambled gibberish</strong> to observers</li>
              <li>Look for: <code>https://</code> and a lock icon in the address bar</li>
              <li>Note: Metadata (which sites you visit) is still visible to your network</li>
            </ul>
          </div>

          <div class="section vpn">
            <h2>VPN (Virtual Private Network)</h2>
            <ul>
              <li>Creates an <strong>encrypted tunnel</strong> for ALL your traffic</li>
              <li>Hides which websites you visit from local observers</li>
              <li>Traffic appears to come from VPN server, not your device</li>
              <li>Useful on untrusted networks (coffee shops, airports, hotels)</li>
              <li>Note: VPN provider can see your traffic - choose a trusted one</li>
            </ul>
          </div>

          <h2>Quick Comparison</h2>
          <table class="comparison-table">
            <tr>
              <th>What's Protected?</th>
              <th>HTTP</th>
              <th>HTTPS</th>
              <th>HTTPS + VPN</th>
            </tr>
            <tr>
              <td>Your passwords</td>
              <td class="bad">Visible</td>
              <td class="good">Encrypted</td>
              <td class="good">Encrypted</td>
            </tr>
            <tr>
              <td>Form data you submit</td>
              <td class="bad">Visible</td>
              <td class="good">Encrypted</td>
              <td class="good">Encrypted</td>
            </tr>
            <tr>
              <td>Websites you visit</td>
              <td class="bad">Visible</td>
              <td class="bad">Visible</td>
              <td class="good">Hidden</td>
            </tr>
            <tr>
              <td>Your IP address</td>
              <td class="bad">Visible</td>
              <td class="bad">Visible</td>
              <td class="good">Hidden</td>
            </tr>
          </table>

          <div class="tips">
            <h3>Public Wi-Fi Safety Tips</h3>
            <ul>
              <li>Always verify the network name with staff before connecting</li>
              <li>Look for HTTPS (lock icon) before entering any sensitive information</li>
              <li>Consider using a VPN when on untrusted networks</li>
              <li>Avoid logging into banking or sensitive accounts on public Wi-Fi</li>
              <li>Turn off auto-connect to Wi-Fi networks</li>
            </ul>
          </div>

          <p style="text-align: center; margin-top: 32px; color: #64748b; font-size: 14px;">
            The Glass Wall - Network Security Training
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-cheat-sheet">
            <FileText className="w-4 h-4 mr-2" />
            Cheat Sheet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5" />
            Network Security Cheat Sheet
          </DialogTitle>
          <DialogDescription>
            A quick reference guide for HTTP, HTTPS, and VPN security concepts
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button onClick={handlePrint} variant="outline" data-testid="button-print-cheat-sheet">
            <Printer className="w-4 h-4 mr-2" />
            Print / Save as PDF
          </Button>
        </div>

        <div ref={printRef} className="space-y-6">
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center gap-2 mb-3">
              <Unlock className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-lg text-foreground">HTTP (Insecure)</h3>
              <Badge variant="destructive" className="text-xs">Not Safe</Badge>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Data travels in <strong className="text-foreground">plain text</strong> - anyone on the network can read it</span>
              </li>
              <li className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Passwords, usernames, and personal data are <strong className="text-foreground">visible</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>No protection against eavesdropping on public Wi-Fi</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-lg text-foreground">HTTPS (Secure)</h3>
              <Badge className="bg-green-500/10 text-green-600 text-xs">Safe</Badge>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Data is <strong className="text-foreground">encrypted</strong> before sending</span>
              </li>
              <li className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Passwords and personal data appear as <strong className="text-foreground">scrambled gibberish</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Note: Metadata (which sites you visit) is still visible to your network</span>
              </li>
            </ul>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-lg text-foreground">VPN (Virtual Private Network)</h3>
              <Badge className="bg-purple-500/10 text-purple-600 text-xs">Extra Protection</Badge>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Creates an <strong className="text-foreground">encrypted tunnel</strong> for ALL your traffic</span>
              </li>
              <li className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>Hides which websites you visit from local observers</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Note: VPN provider can see your traffic - choose a trusted one</span>
              </li>
            </ul>
          </Card>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold text-foreground">What's Protected?</th>
                  <th className="p-3 text-center font-semibold text-foreground">HTTP</th>
                  <th className="p-3 text-center font-semibold text-foreground">HTTPS</th>
                  <th className="p-3 text-center font-semibold text-foreground">HTTPS + VPN</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 text-muted-foreground">Your passwords</td>
                  <td className="p-3 text-center">
                    <Badge variant="destructive" className="text-xs">Visible</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge className="bg-green-500/10 text-green-600 text-xs">Encrypted</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge className="bg-green-500/10 text-green-600 text-xs">Encrypted</Badge>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 text-muted-foreground">Form data you submit</td>
                  <td className="p-3 text-center">
                    <Badge variant="destructive" className="text-xs">Visible</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge className="bg-green-500/10 text-green-600 text-xs">Encrypted</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge className="bg-green-500/10 text-green-600 text-xs">Encrypted</Badge>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 text-muted-foreground">Websites you visit</td>
                  <td className="p-3 text-center">
                    <Badge variant="destructive" className="text-xs">Visible</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="destructive" className="text-xs">Visible</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge className="bg-green-500/10 text-green-600 text-xs">Hidden</Badge>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 text-muted-foreground">Your IP address</td>
                  <td className="p-3 text-center">
                    <Badge variant="destructive" className="text-xs">Visible</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="destructive" className="text-xs">Visible</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge className="bg-green-500/10 text-green-600 text-xs">Hidden</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-foreground">Public Wi-Fi Safety Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Always verify the network name with staff before connecting</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Look for HTTPS (lock icon) before entering any sensitive information</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Consider using a VPN when on untrusted networks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Avoid logging into banking or sensitive accounts on public Wi-Fi</span>
              </li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
