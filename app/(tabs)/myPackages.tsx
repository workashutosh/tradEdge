import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    View,
    useColorScheme,
    Linking
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
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


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title={"Your Packs"} />
            <FlatList
                data={purchasedPackages}
                keyExtractor={(item) => item.package_id}
                contentContainerStyle={{ paddingTop: 16 }} // Add padding at the top
                renderItem={({ item }) => (
                    <ThemedView key={item.package_id} style={[styles.cardContainer, { shadowColor: colors.shadowColor }]}>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            {/* Icon and Title */}
                            <View style={styles.cardHeader}>
                                <MaterialIcons name="bar-chart" size={32} color={colors.primary} />
                                <ThemedText type="title" style={[styles.cardTitle, { color: colors.text }]}>
                                    {item.title}
                                </ThemedText>
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

                            {/* Purchase Date */}
                            <View>
                                <ThemedText type="default" style={{ color: colors.text }}>
                                    {`Date: ${
                                        userTransactions.find(
                                            (transaction) => transaction.package_details.subtype_id === item.package_id
                                        )?.purchase_info?.purchase_date || 'N/A'
                                    }`}
                                </ThemedText>
                            </View>

                            {/* Buttons Section */}
                            <View style={styles.buttonRow}>
                                {/* Enquiry Button */}
                                <TouchableOpacity
                                    style={[styles.enquiryButton, { backgroundColor: colors.text }]}
                                    onPress={() => Linking.openURL('tel:7400330785')} // Open the phone dialer with the number
                                >
                                    <FontAwesome name="phone" size={14} color={colors.card} style={{ marginRight: 5 }} />
                                    <ThemedText type="defaultSemiBold" style={[styles.buttonText, { color: colors.card }]}>
                                        Enquiry
                                    </ThemedText>
                                </TouchableOpacity>

                                {/* Buy Button with Gradient */}
                                <TouchableOpacity
                                    onPress={() => handleTradePress(item)}
                                    style={{ flex: 1 }} // Ensure the entire button is clickable
                                >
                                    <LinearGradient
                                        colors={['#04810E', '#039D74']} // Gradient colors
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.buyButton]} // Apply gradient to the button
                                    >
                                        <ThemedText type="defaultSemiBold" style={[styles.buttonText, { color: colors.card }]}>
                                            Buy
                                        </ThemedText>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
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
        borderBottomWidth: 1,
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
        // borderTopWidth: 1,
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
    detailBox: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailIcon: {
        marginBottom: 4,
    },
    enquiryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
    },
    buyButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});