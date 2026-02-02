"use client"

import { useState, useEffect } from "react"
import { Briefcase, Search, Phone, Mail, TrendingUp, User, Building, MapPin, Calendar, FileText, Folder } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

type Agent = {
    id: string
    name: string
    phone?: string
    email?: string
}

type Agreement = {
    id: string
    flatNo: string
    building?: string
    region?: string
    startDate?: string
    endDate?: string
    owner?: { agentName?: string; building?: string }
    tenant?: { agentName?: string; building?: string }
    ownerAgentCommission?: number // Root level
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [agreements, setAgreements] = useState<Agreement[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [agentsRes, agreementsRes] = await Promise.all([
                    fetch("/api/agents"),
                    fetch("/api/agreements")
                ])

                const agentsData = await agentsRes.json()
                const agreementsData = await agreementsRes.json()

                setAgents(agentsData.agents || [])
                setAgreements(agreementsData.agreements || [])
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Calculate Commissions Map
    const agentCommissions = agents.reduce((acc, agent) => {
        const total = agreements.reduce((sum, agreement) => {
            let currentAgreementTotal = 0;

            if (agreement.owner?.agentName === agent.name) {
                currentAgreementTotal += (agreement.ownerAgentCommission || 0);
            }

            if (agreement.tenant?.agentName === agent.name) {
                // Tenant commission field removed
            }

            return sum + currentAgreementTotal;
        }, 0);

        acc[agent.id] = total;
        return acc;
    }, {} as Record<string, number>);


    // Get History for Selected Agent
    const getAgentHistory = (agentName: string) => {
        return agreements.filter(a =>
            a.owner?.agentName === agentName || a.tenant?.agentName === agentName
        ).map(agreement => {
            let amount = 0;
            const roles: string[] = [];

            if (agreement.owner?.agentName === agentName) {
                amount += (agreement.ownerAgentCommission || 0);
                roles.push("Owner Agent");
            }
            if (agreement.tenant?.agentName === agentName) {
                roles.push("Tenant Agent");
            }

            return {
                ...agreement,
                commissionAmount: amount,
                roles: roles.join(" & ")
            };
        });
    };

    // Filter Agents
    const ownerAgentNames = new Set(agreements.map(a => a.owner?.agentName).filter(Boolean));

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (agent.phone && agent.phone.includes(searchQuery));

        const isOwnerAgent = ownerAgentNames.has(agent.name);

        return matchesSearch && isOwnerAgent;
    })

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                    <Briefcase className="h-8 w-8 text-primary" />
                    Agents Overview
                </h2>
                <p className="text-muted-foreground mt-2">
                    Manage agents and view their total earnings from commissions.
                </p>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                    Total Agents: <span className="font-bold text-slate-900">{agents.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl" />
                    ))
                ) : filteredAgents.length > 0 ? (
                    filteredAgents.map(agent => (
                        <Card
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className="hover:shadow-md transition-all cursor-pointer border-slate-200 hover:border-blue-300 hover:bg-blue-50/10 group"
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{agent.name}</span>
                                            {agent.phone && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {agent.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 pt-4 border-t border-slate-100 group-hover:border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Earnings</span>
                                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="font-bold text-lg">
                                                ₹{agentCommissions[agent.id]?.toLocaleString() || "0"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No agents found.
                    </div>
                )}
            </div>

            {/* History Dialog */}
            <Dialog open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <User className="h-5 w-5 text-blue-600" />
                            <span>{selectedAgent?.name} - Commission History</span>
                        </DialogTitle>
                        <DialogDescription>
                            Earnings breakdown by agreement.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">
                        {selectedAgent && getAgentHistory(selectedAgent.name).length > 0 ? (
                            <div className="space-y-3">
                                {getAgentHistory(selectedAgent.name).map((item, idx) => (
                                    <div key={idx} className="flex items-start justify-between p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors shadow-sm">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 font-semibold text-slate-800">
                                                <Folder className="h-4 w-4 text-yellow-600" />
                                                <span>{item.flatNo}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Building className="h-3.5 w-3.5" />
                                                {/* Use top-level building, or check nested owner/tenant if missing */}
                                                <span>{item.building || item.owner?.building || item.tenant?.building || "Unknown Building"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <MapPin className="h-3 w-3" />
                                                <span>{item.region}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-emerald-700 font-bold text-lg">
                                                ₹{item.commissionAmount.toLocaleString()}
                                            </div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                                {item.roles}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center pt-4 border-t mt-4">
                                    <span className="font-semibold text-slate-700">Total Calculated</span>
                                    <span className="font-bold text-xl text-emerald-600">
                                        ₹{agentCommissions[selectedAgent.id]?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                <p>No commission history found for this agent.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
