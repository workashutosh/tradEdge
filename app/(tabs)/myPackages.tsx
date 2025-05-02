import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    View,
    useColorScheme
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useUser } from '@/context/UserContext';
import { useStockContext } from '@/context/StockContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useTheme } from '@/utils/theme'

interface Package {
    package_id: string;
}

export default function MyPackages() {

    
    const [packagesId, setPackagesId] = useState<Package[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const { userTransactions } = useUser();
    const { packages } = useStockContext();
    const colors = useTheme();


    useEffect(() => {
        // Extract subtype_id from userTransactions and store in packagesId
        const extractedPackagesId = userTransactions.map((transaction) => ({
            package_id: transaction.package_details.subtype_id,
        }));
        setPackagesId(extractedPackagesId);
        setLoading(false);
    }, [userTransactions]);

    const purchasedPackages = packages.filter((pkg) =>
        packagesId.some((p) => p.package_id === pkg.package_id)
    );


    const handlePackagePress = (item: any) => {
        router.push({
            pathname: '/main/TradeDetails',
            params: {
                package_id: item.package_id,
            },
        });
    };


    if (loading) {
        return (
            <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText style={{ color: colors.text }}>Loading...</ThemedText>
            </SafeAreaView>
        );
    }


    if (purchasedPackages.length === 0) {
        return (
            <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
                <ThemedText style={{ color: colors.text }}>No packages purchased yet.</ThemedText>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title={"Your Packs"} />
            <FlatList
                data={purchasedPackages}
                keyExtractor={(item) => item.package_id}
                contentContainerStyle={{ paddingTop: 16 }} // Add padding at the top
                renderItem={({ item }) => (
                    <ThemedView style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}>
                        <TouchableOpacity onPress={() => handlePackagePress(item)}>
                            <View style={[styles.card, { backgroundColor: colors.card }]}>
                                <View style={[styles.cardHeader, { borderBottomColor: colors.text }]}>
                                    <ThemedText style={[styles.cardTitle, { color: colors.text }]}>{item.title}</ThemedText>
                                </View>
                                <View style={[styles.cardDetails, { borderBottomColor: colors.text }]}>
                                    <View style={[styles.detailRow, { borderRightWidth: 1, borderRightColor: colors.text }]}>
                                        <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Price</ThemedText>
                                        <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                            ₹ {new Intl.NumberFormat('en-IN').format(Number(item.price))}
                                        </ThemedText>
                                    </View>
                                    <View style={[styles.detailRow, { borderRightWidth: 1, borderRightColor: colors.text }]}>
                                        <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Risk Category</ThemedText>
                                        <View style={styles.riskTag}>
                                            <MaterialIcons name="check-circle" size={14} color={colors.success} />
                                            <ThemedText style={[styles.detailValue, { color: colors.success }]}>
                                                {item.riskCategory || 'N/A'}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <ThemedText style={[styles.detailLabel, { color: colors.text }]}>Profit Potential</ThemedText>
                                        <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                                            {item.profitPotential || 'N/A'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <View style={[styles.buttonRow, { borderTopColor: colors.text }]}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { backgroundColor: colors.buttonPrimary }]}
                                        onPress={() => handlePackagePress(item)}
                                    >
                                        <ThemedText style={styles.actionButtonText}>View Details</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </ThemedView>
                )}
            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardContainer: {
        marginBottom: 16,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#3498db',
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    card: {
        borderRadius: 12,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        // borderBottomWidth: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 8,
    },
    detailRow: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    riskTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    actionButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});