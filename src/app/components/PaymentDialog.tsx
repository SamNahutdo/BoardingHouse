import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { CreditCard, MapPin } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSelect: (method: 'online' | 'pay-on-site') => void;
  propertyName: string;
  price: number;
}

export function PaymentDialog({ open, onOpenChange, onPaymentSelect, propertyName, price }: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<'online' | 'pay-on-site' | null>(null);

  const handleConfirm = () => {
    if (selectedMethod) {
      onPaymentSelect(selectedMethod);
      onOpenChange(false);
      setSelectedMethod(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
          <DialogDescription>
            Select how you'd like to pay for your reservation at {propertyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-green-600">₱{price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Monthly rate</p>
          </div>

          <div className="space-y-3">
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedMethod === 'online'
                  ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedMethod('online')}
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold">Pay Online</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure online payment. Reservation confirmed immediately.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedMethod === 'pay-on-site'
                  ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedMethod('pay-on-site')}
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Pay on Site</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay when you arrive. Reservation held for 24 hours.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedMethod}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Confirm Reservation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}