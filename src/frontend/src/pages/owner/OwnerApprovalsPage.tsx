import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListApprovals, useSetApproval, useRejectAllPending, useGetInviteOnlyMode, useSetInviteOnlyMode, useIsCallerAdmin } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Shield, ArrowLeft } from 'lucide-react';
import { ApprovalStatus } from '../../backend';
import { toast } from 'sonner';

export default function OwnerApprovalsPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: approvals = [], isLoading: approvalsLoading } = useListApprovals();
  const { data: inviteOnlyMode = true, isLoading: modeLoading } = useGetInviteOnlyMode();
  const setApproval = useSetApproval();
  const rejectAllPending = useRejectAllPending();
  const setInviteOnlyMode = useSetInviteOnlyMode();
  const [processingPrincipal, setProcessingPrincipal] = useState<string | null>(null);

  // Redirect if not admin
  if (!adminLoading && !isAdmin) {
    navigate({ to: '/' });
    return null;
  }

  const pendingApprovals = approvals.filter(a => a.status === ApprovalStatus.pending);
  const approvedUsers = approvals.filter(a => a.status === ApprovalStatus.approved);
  const rejectedUsers = approvals.filter(a => a.status === ApprovalStatus.rejected);

  const handleApprove = async (principal: string) => {
    setProcessingPrincipal(principal);
    try {
      await setApproval.mutateAsync({
        user: { toText: () => principal } as any,
        status: ApprovalStatus.approved,
      });
      toast.success('User approved successfully');
    } catch (error: any) {
      toast.error('Failed to approve user');
    } finally {
      setProcessingPrincipal(null);
    }
  };

  const handleReject = async (principal: string) => {
    setProcessingPrincipal(principal);
    try {
      await setApproval.mutateAsync({
        user: { toText: () => principal } as any,
        status: ApprovalStatus.rejected,
      });
      toast.success('User rejected');
    } catch (error: any) {
      toast.error('Failed to reject user');
    } finally {
      setProcessingPrincipal(null);
    }
  };

  const handleRejectAll = async () => {
    try {
      await rejectAllPending.mutateAsync(pendingApprovals);
      toast.success(`Rejected ${pendingApprovals.length} pending request(s)`);
    } catch (error: any) {
      toast.error('Failed to reject all pending requests');
    }
  };

  const handleToggleMode = async (enabled: boolean) => {
    try {
      await setInviteOnlyMode.mutateAsync(enabled);
      toast.success(enabled ? 'Invite-only mode enabled' : 'Public mode enabled');
    } catch (error: any) {
      toast.error('Failed to update mode');
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.pending:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case ApprovalStatus.approved:
        return <Badge variant="default" className="gap-1 bg-emerald-600"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case ApprovalStatus.rejected:
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
    }
  };

  if (adminLoading || approvalsLoading || modeLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Management</h1>
          <p className="text-muted-foreground">Manage user approvals and access control</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Invite-Only Mode</CardTitle>
          </div>
          <CardDescription>
            Control whether the app is open to everyone or requires approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="invite-mode" className="text-base font-medium">
                Require approval for new users
              </Label>
              <p className="text-sm text-muted-foreground">
                {inviteOnlyMode 
                  ? 'Only approved users can access the app'
                  : 'Any authenticated user can access the app'
                }
              </p>
            </div>
            <Switch
              id="invite-mode"
              checked={inviteOnlyMode}
              onCheckedChange={handleToggleMode}
              disabled={setInviteOnlyMode.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {inviteOnlyMode && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>
                    {pendingApprovals.length} user(s) waiting for approval
                  </CardDescription>
                </div>
                {pendingApprovals.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Reject All Pending
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject all pending requests?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reject {pendingApprovals.length} pending access request(s). This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRejectAll} disabled={rejectAllPending.isPending}>
                          {rejectAllPending.isPending ? 'Rejecting...' : 'Reject All'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No pending requests
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((approval) => {
                      const principalText = approval.principal.toText();
                      const isProcessing = processingPrincipal === principalText;
                      return (
                        <TableRow key={principalText}>
                          <TableCell className="font-mono text-xs">{principalText}</TableCell>
                          <TableCell>{getStatusBadge(approval.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(principalText)}
                                disabled={isProcessing || setApproval.isPending}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(principalText)}
                                disabled={isProcessing || setApproval.isPending}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approved Users</CardTitle>
              <CardDescription>
                {approvedUsers.length} user(s) with access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedUsers.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No approved users yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUsers.map((approval) => {
                      const principalText = approval.principal.toText();
                      const isProcessing = processingPrincipal === principalText;
                      return (
                        <TableRow key={principalText}>
                          <TableCell className="font-mono text-xs">{principalText}</TableCell>
                          <TableCell>{getStatusBadge(approval.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(principalText)}
                              disabled={isProcessing || setApproval.isPending}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {rejectedUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rejected Users</CardTitle>
                <CardDescription>
                  {rejectedUsers.length} user(s) denied access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedUsers.map((approval) => {
                      const principalText = approval.principal.toText();
                      const isProcessing = processingPrincipal === principalText;
                      return (
                        <TableRow key={principalText}>
                          <TableCell className="font-mono text-xs">{principalText}</TableCell>
                          <TableCell>{getStatusBadge(approval.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(principalText)}
                              disabled={isProcessing || setApproval.isPending}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
