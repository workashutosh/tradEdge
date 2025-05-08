import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/context/UserContext';
import { useStockContext } from '@/context/StockContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useTheme } from '@/utils/theme'
import { BadgeCheck, BadgeIndianRupeeIcon } from 'lucide-react-native';

interface Package {
    package_id: string;
}

export default function MyPackages() {

    const [packagesId, setPackagesId] = useState<Package[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { userTransactions, purchasedPackagesId } = useUser();
    const { packages } = useStockContext();
    const colors = useTheme();


    useEffect(() => {
        // Extract subtype_id(package_id) from userTransactions and store in packagesId
        const extractedPackagesId = userTransactions.map((transaction) => ({
            package_id: transaction.package_details.subtype_id,
        }));
        setPackagesId(extractedPackagesId);
        setLoading(false);
    }, [userTransactions]);

    const purchasedPackages = packages.filter((pkg) =>
        purchasedPackagesId.some((p) => p === pkg.package_id)
    );


    const handleTradePress = (item: any) => {
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

    const formattedDate = (item: string) => {
        return new Date(item.replace(' ', 'T')).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }



    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title={"Your Packs"} />
            <FlatList
                data={purchasedPackages}
                keyExtractor={(item) => item.package_id}
                contentContainerStyle={{ paddingTop: 16 }} // Add padding at the top
                renderItem={({ item }) => (
                    <TouchableOpacity
                        key={item.package_id}
                        onPress={() => handleTradePress(item)} // Make the whole card clickable
                        activeOpacity={0.7} // Ensure the card click doesn't interfere with button clicks
                        style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}
                    >
                        <ThemedView style={[styles.card, { backgroundColor: colors.card }]}>
                            {/* Header Section */}
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ThemedText
                                        style={[styles.cardTitle, { color: colors.vgreen }]}
                                    >
                                        {item.title}
                                    </ThemedText>
                                    {/* <FontAwesome name="check-circle" size={16} color={colors.success} style={{ marginLeft: 5 }} /> */}
                                    <BadgeIndianRupeeIcon size={24} color={colors.success} style={{ marginLeft: 5 }} />

                                </View>
                                {/* <ThemedText type="subtitle" style={[styles.cardTitle]}>
                                    Tradedge Package
                                </ThemedText> */}
                            </View>

                            {/* Details Section */}
                            <View style={styles.cardDetails}>
                                <View style={styles.detailBox}>
                                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                                    <ThemedText type="subtitle" style={styles.detailLabel}>
                                        Min Investment
                                    </ThemedText>
                                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                                        ₹ {new Intl.NumberFormat('en-IN').format(Number(item.minimumInvestment))}
                                    </ThemedText>
                                </View>
                                <View style={styles.detailBox}>
                                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                                    <ThemedText type="subtitle" style={styles.detailLabel}>
                                        Risk Category
                                    </ThemedText>
                                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                                        {item.riskCategory || 'N/A'}
                                    </ThemedText>
                                </View>
                                <View style={styles.detailBox}>
                                    <FontAwesome name="check-circle" size={12} color={colors.success} style={styles.detailIcon} />
                                    <ThemedText type="subtitle" style={styles.detailLabel}>
                                        Profit Potential
                                    </ThemedText>
                                    <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                                        {item.profitPotential || 'N/A'}
                                    </ThemedText>
                                </View>
                            </View>

                            {/* Buttons Section */}
                            <View style={styles.buttonRow}>

                                {/* Purchase Date */}
                                <View>
                                    <ThemedText type="default" style={{ color: colors.text }}>
                                        {`${formattedDate(userTransactions.find(
                                            (transaction) => transaction.package_details.subtype_id === item.package_id
                                        )?.purchase_info?.purchase_date || 'N/A')} `}
                                    </ThemedText>
                                </View>

                                {/* Buy Button with Gradient */}
                                <TouchableOpacity
                                    onPress={() => handleTradePress(item)}
                                    style={{}} // Ensure the entire button is clickable
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#04810E', '#039D74']} // Gradient colors
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.buyButton]} // Apply gradient to the button
                                    >
                                        <ThemedText type="defaultSemiBold" style={[styles.buttonText, { color: colors.card }]}>
                                            Details
                                        </ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ThemedView>
                    </TouchableOpacity>
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
        marginHorizontal: 12,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    card: {
        borderRadius: 12,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        color: 'grey',
        fontSize: 14,
        fontWeight: '500',
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailBox: {
        flex: 1,
        maxWidth: '32%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingBottom: 6,
        alignItems: 'center',
    },
    detailIcon: {
        alignSelf: 'flex-end',
        marginRight: 2,
        marginTop: 2,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '300',
        marginBottom: 0,
        textAlign: 'center',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    enquiryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
    },
    buyButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});